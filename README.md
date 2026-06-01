[ Client Applications ]
                     ( Mobile Apps / Web Clients )
                                  │
                                  │ HTTPS / WSS (Secure TLS 1.3)
                                  ▼
                     [ API Gateway / Reverse Proxy ]
               (Nginx / Traefik: Rate Limiting & SSL Termination)
                                  │
                                  ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │             MODULAR MONOLITHIC RUNTIME CONTAINER                │
 │                  (Zone-Locked to Asia/Kolkata)                  │
 │                                                                 │
 │  ┌──────────────────────┐             ┌──────────────────────┐  │
 │  │    Auth & Session     │             │    Flats (Groups)    │  │
 │  │        Module        │             │        Module        │  │
 │  └──────────────────────┘             └──────────────────────┘  │
 │             │                                     │             │
 │             ▼                                     ▼             │
 │   ================================───────────────────────────   │
 │     INTERNAL SYNCHRONOUS / ASYNCHRONOUS EVENT BUS (Broker)      │
 │   ================================───────────────────────────   │
 │             ▲                                     ▲             │
 │             │                                     │             │
 │  ┌──────────────────────┐             ┌──────────────────────┐  │
 │  │   Metric & Streak    │             │ Leaderboard & Reward │  │
 │  │        Module        │             │   Module (Engine)    │  │
 │  └──────────────────────┘             └──────────────────────┘  │
 │             │                                     │             │
 │             └──────────────────┬──────────────────┘             │
 │                                ▼                                │
 │                   ┌──────────────────────────┐                  │
 │                   │   Notification Module    │                  │
 │                   │ (In-App / Push / Email)  │                  │
 │                   └──────────────────────────┘                  │
 └────────────────────────────────┬────────────────────────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌─────────────────────────────────┐               ┌─────────────────────────────────┐
│     CACHING & TRANSIENT STATE   │               │   RELATIONAL DATABASE STORAGE   │
│         (Redis / Valkey)        │               │          (PostgreSQL)           │
│                                 │               │                                 │
│ ┌─────────────────────────────┐ │               │ ┌─────────────────────────────┐ │
│ │ Live Leaderboards           │ │               │ │ User Profiles & Credentials │ │
│ │ (Sorted Sets by IST Window) │ │               │ └─────────────────────────────┘ │
│ └─────────────────────────────┘ │               │ ┌─────────────────────────────┐ │
│ ┌─────────────────────────────┐ │               │ │ Flat Memberships & Invites  │ │
│ │ Session & Rate-Limit Cache  │ │               │ └─────────────────────────────┘ │
│ └─────────────────────────────┘ │               │ ┌─────────────────────────────┐ │
│                                 │               │ │ Immutable Metrics Ledger    │ │
│                                 │               │ │ (Audit Logs with Timestamps)│ │
│                                 │               │ └─────────────────────────────┘ │
└─────────────────────────────────┘               └─────────────────────────────────┘




gym-tracking-platform/
│
├── .gitignore                 # Enforces security boundaries (ignores secrets, logs, and node_modules)
├── .env.example               # Non-sensitive structure template for configuration setup
├── docker-compose.yml         # Container coordination (FastAPI, Postgres, Redis, Frontend Nginx)
├── README.md                  # Verification, bootstrap execution scripts, and runbook
│
├── backend/                   # Python FastAPI Modular Monolith Engine
│   ├── Dockerfile             # Multi-stage secure build (Executes under non-root unprivileged appuser)
│   ├── requirements.txt       # Pin-hashed production dependencies
│   └── app/
│       ├── __init__.py
│       ├── main.py            # Global application bootstrapper & centralized routing engine
│       ├── config.py          # Secure environment variables parser (Pydantic Settings)
│       │
│       ├── core/              # Shared cross-cutting architectural concerns
│       │   ├── database.py    # PostgreSQL pool setup (Explicitly locks sessions to Asia/Kolkata)
│       │   ├── redis_pool.py  # Optimized connection management for real-time memory state
│       │   ├── security.py    # Cryptographic infrastructure (Argon2id & JWT token management)
│       │   └── exceptions.py  # Global error sanitization and semantic HTTP wrappers
│       │
│       ├── modules/           # Self-Contained Domain Modules (No cross-database imports)
│       │   ├── auth/          # Identity Lifecycle
│       │   │   ├── models.py      # PostgreSQL User accounts & device tracking schemas
│       │   │   ├── schemas.py     # Pydantic input/output verification definitions
│       │   │   ├── routes.py      # Endpoints for register, login, refresh, logout, reset
│       │   │   ├── services.py    # Core identity business logic operations
│       │   │   └── utils.py       # Password validation and token validation helper functions
│       │   │
│       │   ├── metrics/       # Configurable Metric Tracking & Streak Engine
│       │   │   ├── models.py      # Daily targets configuration & transactional tracking ledger
│       │   │   ├── schemas.py     # Payload validators (water intake, protein counts, etc.)
│       │   │   ├── routes.py      # Metric submission and user log endpoints
│       │   │   └── services.py    # Streak calculation mechanics and milestone validation
│       │   │
│       │   ├── flats/         # User Group Coordination (Flats)
│       │   │   ├── models.py      # Group topology & relational user-membership tables
│       │   │   ├── schemas.py     # Group management & invitation payloads
│       │   │   ├── routes.py      # Flat creation, membership alterations, and invite routes
│       │   │   └── services.py    # Membership lifecycle, ownership enforcement, and scope logic
│       │   │
│       │   ├── leaderboards/  # High-speed caching & Permanent Record Archival
│       │   │   ├── models.py      # PostgreSQL Schema: ONLY final snapshot logs (final_leaderboard_records)
│       │   │   ├── schemas.py     # Structured response models for active and past standings
│       │   │   ├── routes.py      # Live cache reading & historical snapshot lookup endpoints
│       │   │   └── services.py    # Interaction with Redis ZSETs & snapshot execution handlers
│       │   │
│       │   └── notifications/ # Notification Management
│       │       ├── models.py      # Dispatch records and user communication channels matrices
│       │       ├── schemas.py     # Preferences models & payload blueprints
│       │       ├── routes.py      # In-App notification feed fetching and preference updates
│       │       └── services.py    # Rate-limiting, priority execution, and SMTP/Push integrations
│       │
│       └── workers/           # Asynchronous Pipeline Environment
│           ├── celery_app.py  # Celery instance bootstrap (Hardcoded timezone='Asia/Kolkata')
│           └── tasks.py       # Cron tasks (Freeze/Materialize snapshot data at 23:59:59 IST)
│
└── frontend/                  # Cross-Compatible Mobile & Laptop Client
    ├── Dockerfile             # Multi-stage production build serving optimized assets via Nginx
    ├── package.json           # Client dependency manifest
    ├── vite.config.js         # Hot module reload dev compiler and bundle builder
    ├── tailwind.config.js     # Adaptive view breakpoints layout variables
    └── src/
        ├── main.jsx           # Client application instantiation mount point
        ├── App.jsx            # Core routing switchboard matrix
        ├── assets/            # Static high-contrast icons and vector badges
        │
        ├── components/        # Isolated Atomic UI Widgets (Independent of routing)
        │   ├── ui/                # Base design tokens (Button, Input, Badge, Card, Modal)
        │   ├── common/            # Shared features (ProtectedRoute, ThemeToggle, LoadingOverlay)
        │   └── tracking/          # Visual tracking rings, incremental metric logging sliders
        │
        ├── context/           # React Global Context Providers
        │   ├── AuthContext.jsx    # Session retention, credential refreshing, device tracking
        │   └── TimeContext.jsx    # Guarantees front-end UI forces date calculations relative to IST
        │
        ├── hooks/             # Custom Shared API Hooks
        │   ├── useAuth.js         # Interface for authentication states
        │   ├── useMetrics.js      # Form handles for swift logging and goal checking
        │   └── useLeaderboard.js  # Connectors for streaming standings and browsing historical data
        │
        ├── layouts/           # Dynamic Structure Organizers
        │   └── AppShell.jsx       # Adaptive Grid Shell (Mobile: Bottom Navigation | Laptop: Side Drawer)
        │
        ├── pages/             # Route-bound Main Views
        │   ├── Login.jsx          # Login UI with password reset trigger
        │   ├── Dashboard.jsx      # Progress hub (Ticking metrics, active streaks, badge highlights)
        │   ├── Flats.jsx          # Flat creation space, user list, pending invites manager
        │   ├── Leaderboards.jsx   # Tabbed view: Live Standings vs Past Final Snapshot snapshots selector
        │   └── Profile.jsx        # Public/Private visibility summary cards (History, Badges)
        │
        ├── services/          # Networking Bridge
        │   └── api.js             # Hardened Axios client with automated Interceptors for token rotation
        │
        └── utils/             # Front-end Helper Logic
            └── dateHelpers.js     # String formatters explicitly converting client time structures to IST





Phase 2 — Tech Stack DecisionFor a production-grade system with a small initial user base, our goal is to eliminate operational complexity while ensuring the system remains completely secure, audit-safe, and cleanly decoupled. We select the following production stack:1. Core Core Engine & RuntimePython Framework: FastAPIWhy: FastAPI offers native asynchronous (asyncio) support, which allows efficient handling of concurrent network connections (I/O bounds like notification dispatches and database queries) without spawning heavy process pools. It provides built-in validation via Pydantic v2, auto-generating OpenAPI schemas.Security Best Practice: Direct mapping of Pydantic models guarantees strict structural compliance for incoming API request payloads, providing protection against Mass Assignment vulnerabilities.WSGI/ASGI Production Server: Uvicorn + GunicornWhy: Gunicorn acts as a process manager monitoring a cluster of asynchronous Uvicorn worker threads. This isolates runtime crashes and guarantees process-level resilience inside our single deployment container.2. Storage & Memory InfrastructureSingle Source of Truth DB: PostgreSQL 16+Why: To support absolute auditability, strict constraints, and transactional consistency for streaks and metrics, we use a relational foundation.Timezone Enforcement: Database timestamps will be explicitly designated as TIMESTAMP WITH TIME ZONE (TIMESTAMPTZ). All connection parameters from our Python runtime will enforce the Asia/Kolkata context.Data Integrity Protection: We will enforce 隔离级别 (Isolation Levels) to Read Committed or Serializable where necessary, along with strict unique multi-column database constraints to prevent race conditions during leaderboard metric calculations.In-Memory Data Structure Store: Redis 7.4 (or Valkey)Why: Redis provides native Sorted Sets (ZSET), which are optimized for real-time leaderboard applications. Finding a user's relative position or grabbing a slice of rankings (e.g., top 3 users) runs in $O(\log N + M)$ execution time complexity, keeping performance blazing fast.Cache Management: Used for API rate-limiting tokens, transient web session storage, and immediate lookup of current user tracking metrics for the day.3. Deployment, Worker & Tooling MatrixContainerization Engine: Docker & Docker ComposeWhy: Simplifies multi-service coordination (fastapi-app, postgres-db, redis-cache).Production Best Practice: The application image will build on a minimal, security-hardened Linux footprint (python:3.11-slim or alpine), completely stripping root-user execution contexts inside production runtime engines to mitigate container-escape vectors.Asynchronous Tasks & Background Cron Worker: Celery + Redis BrokerWhy: Leaderboard compilation resets, end-of-month reward calculations, and multi-channel notification deliveries (Push, Email) should never happen synchronously inside an HTTP request-response thread. Celery isolates these operations into separate worker processes.IST Cron Management: Celery Beat will run a dedicated scheduler explicitly configured with timezone = 'Asia/Kolkata' to dispatch clean midnight and monthly reset tasks exactly at 00:00:00 IST.4. Architect's Stack Challenges & Risk Defenses (Rule 2)As a Security and System Architect, I must challenge the common Python implementation defaults to prevent production failure:





Architect's Challenge 4: Real-time Database Materialization vs. On-Demand SnapshotsThe Risk: If the system queries and aggregates the raw metrics_ledger every time a user wants to view historical leaderboards (e.g., "Show me Flat leaderboard from November 2025"), it requires scanning millions of historical rows. This causes intense database CPU spikes and latency bottlenecks. Conversely, if we try to store daily rankings into PostgreSQL dynamically every second, it creates high write-amplification.The Impact: Degraded application performance, database locking issues, and high operating costs.The Solution: We will use a Scheduled Materialization Strategy.Live Standings: Calculated via high-speed, transient Redis Sorted Sets (ZSET) for the active Day, Week, and Month.Historical Standings: At exactly 23:59:59 IST daily, weekly, and monthly, a Celery Beat cron job freezes the current standings and materializes them into a highly optimized database table called historical_leaderboard_snapshots. This table stores data statically (snapshot_date, period_type, entity_type, entity_id, rank, points), allowing instant $O(1)$ lookups for users browsing past records.Product Designer's Strategy: Mobile-First Responsive PWA (Progressive Web App)The Risk: Fitness apps are predominantly used on the gym floor via smartphones (logging water, ticking off workouts). If we design a desktop dashboard and simply shrink it for mobile screens using standard responsive layouts, it often yields clumsy navigation, tiny tap targets, and an unnatural user experience.The Solution: We will adopt a Mobile-First App Shell Design using React + Tailwind CSS. The layouts will feature a bottom navigation bar on mobile (replicating a native iOS/Android feel) that seamlessly transitions into a left-hand persistent sidebar on desktop screens. We will also include safe touch padding (minimum 44x44px per button) and optimistic UI states to handle spotty gym cellular connections smoothly.


Phase 2 — Decide Tech Stack (Revised)
Core Stack Components
Backend Language & Runtime: Python 3.11 running inside isolated Docker containers.

Web Framework: FastAPI (Asynchronous, automated Pydantic v2 payload verification, built-in OpenAPI specifications).

Production ASGI Server: Gunicorn managing Uvicorn worker processes.

Primary Database Engine: PostgreSQL 16+ (All datetime fields bound strictly to TIMESTAMPTZ utilizing Asia/Kolkata contextual zone offsets).

Transient Caching / Active Rankings: Redis 7.4 (or Valkey) using high-speed Sorted Sets (ZSET).

Asynchronous Processing & Crons: Celery + Celery Beat scheduled explicitly to the Asia/Kolkata runtime timezone.

Frontend Web Stack: React (Vite-backed) + Tailwind CSS, engineered from a mobile-first responsive perspective (App Shell layout with safe tap padding and responsive breakpoints).

Technical Architecture Revision: "Only Final Rankings Stored Permanently"
To honor your direct constraint while keeping the platform enterprise-secure and fully auditable against leaderboard manipulation, we define the exact data boundary for rankings:

1. Active / Temporary State (In-Memory Only)
Daily, Weekly, and Monthly active leaderboards (both Global and Flat-level) live exclusively in Redis. As users claim points throughout the current day, week, or month, their point adjustments shift volatile Redis records. No row calculations or rolling point logs are compiled or saved in PostgreSQL for active periods.

2. The Final Snapshot Pipeline (Permanent DB Storage)
At exactly 23:59:59 IST on the final day of a tracking cycle (daily, weekly, or monthly), Celery Beat triggers a freeze routine:

The system reads the absolute final state of the top leaderboard positions directly from the Redis Sorted Set.

A single atomic transaction writes only the final verified data into the PostgreSQL final_leaderboard_records table.

The active Redis cache key is then safely flushed (reset) to begin the next cycle.

Architect's Technical Stack Challenge (Rule 2)
As Security Architect and System Expert, I must flag a critical point regarding this storage strategy to prevent a production failure:

The Risk (The Memory Volatility Gap): Since only final rankings are stored permanently in the database, if the Redis container crashes or drops its memory space mid-month (e.g., on Day 14 of a Monthly leaderboard), two weeks of historical point accumulations will disappear instantly.

The Impact: Users lose their current running points for that active cycle, breaking fairness guidelines, destroying trust, and making fair reward payouts at month-end impossible.

The Recommended Infrastructure Solution: To ensure zero state loss without using heavy database point aggregation tables, we will configure the Redis Docker container with strict hybrid persistence policies: RDB snapshots combined with AOF (Append Only File) logging tuned to appendfsync everysec. If the container experiences an ungraceful restart, Redis instantly replays its local log file on boot, restoring the running leaderboard state up to the last second without ever touching or bloating our primary PostgreSQL database.