# Kosnapur Premier League (KPL) — Clean Architecture Guide

This project follows **Clean Architecture** principles across both the Backend and Frontend with strict TypeScript, separation of concerns, and unidirectional dependency flow.

---

## 1. Directory Structure & Layers

### Backend (`/backend/src`)
Dependencies always point inward: `interfaces` → `application` → `domain`; `infrastructure` implements interfaces from `domain`.

```
backend/src/
├── domain/                  # PURE business logic, entities, value objects, domain services.
│   ├── entities/            # Player, Team, Match, Official, DrawSession, User.
│   ├── enums/               # PlayerLevel ('A'|'B'|'C'|'EXTRA'), UserRole, MatchStatus, SquadRole.
│   ├── services/            # Pure DrawEngine with deterministic RNG interface.
│   └── repositories/        # Repository interfaces (ITeamRepository, IMatchRepository, etc.).
│
├── application/             # Use-cases / Application Services.
│   └── use-cases/           # RegisterPlayer, AssignLevel, UpdateMatchScore, RecordMatchEvent...
│                            # Depends ONLY on domain repository interfaces.
│
├── infrastructure/          # Concrete implementations & external adapters.
│   ├── database/            # Drizzle ORM schema, migrations, connection pool & repositories.
│   ├── auth/                # JwtService (token signing and verification).
│   ├── realtime/            # RealtimePublisher (WebSocket & SSE broadcast).
│   └── rng/                 # CryptoRngAdapter (crypto.randomInt).
│
├── interfaces/              # Entrypoints and controllers.
│   ├── http/                # Express controllers, Zod validation schemas, middlewares, routes.
│   └── realtime/            # WebSocket and SSE connection handlers.
│
├── config/                  # Environment variable validation via Zod (env.ts).
└── shared/                  # AppError, logger, shared constants.
```

### Frontend (`/src`)
```
src/
├── app/                     # Next.js App Router (providers, layouts, route pages).
├── features/                # Domain-oriented vertical slices:
│   ├── matches/             # api/, hooks/, components/, model/
│   ├── standings/           # api/, hooks/, components/, model/
│   ├── teams/               # api/, hooks/, components/, model/
│   ├── players/             # api/, hooks/, components/, model/
│   ├── officials/           # api/, hooks/, components/, model/
│   ├── draw/                # api/, hooks/, components/, model/
│   ├── captain/             # api/, hooks/, components/, model/
│   └── admin/               # api/, hooks/, components/, model/
│
└── shared/                  # Reusable foundations:
    ├── ui/                  # Button, Select, Modal, BottomSheet, Skeleton, ProgressBar...
    ├── lib/                 # apiClient (typed error handling), realtimeClient, formatters, i18n
    └── tokens/              # Colors, radii, animations, z-indices
```

---

## 2. Realtime Synchronization
- **Backend**: `RealtimePublisher` emits events (`MATCH_UPDATE`, `EVENT_ADD`, `DRAW_PICK`, etc.) to all connected WebSocket (`ws://localhost:4000/ws`) and SSE (`/api/realtime/stream`) clients.
- **Frontend**: The `realtimeClient` listens to incoming events and immediately calls `queryClient.setQueryData(...)`, patching the cache in memory with zero layout refetch flashes.

---

## 3. How to Add a New Feature (Example: "Man of the Match")

1. **Domain**:
   - Add property to entity (`Match.manOfTheMatchPlayerId`) in `domain/entities/index.ts`.
   - Add method to repository interface `IMatchRepository.setManOfTheMatch(...)`.
2. **Infrastructure**:
   - Update Drizzle schema in `infrastructure/database/drizzle/schema.ts`.
   - Implement the repository method in `infrastructure/database/repositories/MatchRepository.ts`.
3. **Application**:
   - Create use-case `SetManOfTheMatchUseCase` in `application/use-cases/matches/`.
4. **Interface (HTTP)**:
   - Add Zod DTO validation schema in `interfaces/http/controllers/MatchController.ts`.
   - Register route `PATCH /api/matches/:id/motm` with `requireAuth(['ADMIN', 'OPERATOR'])`.
5. **Frontend**:
   - Add typed API call in `features/matches/api/matchesApi.ts`.
   - Create TanStack Query mutation hook `useSetManOfTheMatchMutation` in `features/matches/hooks/`.
   - Wire presentational component with optimistic update.
