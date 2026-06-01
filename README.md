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