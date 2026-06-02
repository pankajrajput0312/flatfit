import uuid
import secrets
import string
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from redis.asyncio import Redis

from app.modules.flats.models import Flat, FlatMember
from app.modules.flats.schemas import FlatCreate
from app.core.exceptions import ConflictException, ResourceNotFoundException, ForbiddenException

class FlatService:
    """
    Architectural Domain Service handling all robust logic for Groups (Flats).
    Merges state between PostgreSQL (permanent structures) and Redis (ephemeral invites).
    """

    @staticmethod
    async def create_flat(db: AsyncSession, payload: FlatCreate, current_user_id: uuid.UUID) -> Flat:
        """
        1. Instantiates a new Flat.
        2. Automatically makes the founding user an 'admin' in the FlatMember association.
        """
        # Create the core group record
        new_flat = Flat(
            name=payload.name,
            description=payload.description,
            created_by_id=current_user_id
        )
        db.add(new_flat)
        await db.flush() # Flushes to DB to generate the Flat UUID immediately without fully commiting yet.

        # Elevate founder to Admin
        admin_member = FlatMember(
            flat_id=new_flat.id,
            user_id=current_user_id,
            role="admin"
        )
        db.add(admin_member)
        
        await db.commit()
        await db.refresh(new_flat)
        return new_flat

    @staticmethod
    async def generate_invite_code(db: AsyncSession, redis_client: Redis, flat_id: uuid.UUID, requesting_user_id: uuid.UUID) -> tuple[str, int]:
        """
        Produces a 24-hour cryptographic invite code stored completely outside the database.
        """
        # 1. Access Control: Only admins can spawn invites.
        result = await db.execute(
            select(FlatMember)
            .where(FlatMember.flat_id == flat_id)
            .where(FlatMember.user_id == requesting_user_id)
            .where(FlatMember.role == "admin")
        )
        membership = result.scalars().first()
        if not membership:
            raise ForbiddenException("Only Flat admins can generate invite links.")

        # 2. Cryptographic Code Generation (6 chars, easily typed on mobile)
        alphabet = string.ascii_uppercase + string.digits
        invite_code = ''.join(secrets.choice(alphabet) for _ in range(6))
        
        # 3. Inject transient state into Redis (TTL = 86400 seconds / 24 hours)
        redis_key = f"invite:{invite_code}"
        ttl_seconds = 86400
        
        # We store the UUID as a string so Redis handles it natively
        await redis_client.setex(name=redis_key, time=ttl_seconds, value=str(flat_id))
        
        return invite_code, ttl_seconds

    @staticmethod
    async def join_flat_via_code(db: AsyncSession, redis_client: Redis, invite_code: str, joining_user_id: uuid.UUID) -> Flat:
        """
        Redeems an invite code. Checks Redis. If valid, binds the user to the Flat asynchronously.
        """
        # 1. Transient Check
        redis_key = f"invite:{invite_code.upper()}" # Ensure case-insensitivity against typos
        flat_id_str = await redis_client.get(redis_key)
        
        if not flat_id_str:
            raise ResourceNotFoundException("This invite link is invalid or has mathematically expired.")
            
        flat_id = uuid.UUID(flat_id_str)
        
        # 2. Database Action
        new_member = FlatMember(
            flat_id=flat_id,
            user_id=joining_user_id,
            role="member" # Always fallback to least-privileged role
        )
        db.add(new_member)
        
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            # If the database constraint we built trips, they are already a member!
            raise ConflictException("You are already part of this flat.")
            
        # 3. Retrieve the full flat payload to return to the user 
        result = await db.execute(select(Flat).where(Flat.id == flat_id))
        return result.scalars().first()

    @staticmethod
    async def get_user_flats(db: AsyncSession, user_id: uuid.UUID) -> list[Flat]:
        """
        Retrieves all active groups the user belongs to.
        """
        # We use selectinload to eagerly fetch the flat objects tied to the membership rows
        result = await db.execute(
            select(Flat)
            .join(FlatMember)
            .where(FlatMember.user_id == user_id)
        )
        return list(result.scalars().all())
