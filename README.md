# SinScores

SinScores is a mobile-first neighborhood football league tracker built with Next.js 14.  
It provides fixtures/results, standings, player stats, and a lightweight admin workflow for managing leagues.

## How SinScores Works

SinScores has two runtime modes:

- **Testing mode (LocalStorage):** client reads/writes local browser data.
- **Production mode (Google Sheets):** client calls `/api/*` routes; server routes use Google Sheets repositories.

### Data flow

1. UI components call React Query hooks in `src/hooks`.
2. Hooks call `repositories` from `src/infrastructure/container.ts`.
3. In production, `container.ts` uses `apiClient` (`src/lib/apiClient.ts`) and talks to API routes.
4. API routes use `container.server.ts`, which selects Google Sheets repositories when server env vars are present.
5. Business logic (standings, top scorers/assists, player of season) is computed in `src/core/utils`.

This separation keeps browser code free of secret credentials.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **React Query (TanStack Query v5)**
- **next-themes** (dark/light mode)
- **Vitest + React Testing Library**
- **lucide-react** icons
- **qrcode.react** (registration QR code in admin Players tab)

## Environment Variables

Create `.env.local`:

```bash
cp .env.example .env.local
```

### Required / common

- `NEXT_PUBLIC_APP_NAME` (optional display name)
- `NEXT_PUBLIC_PRODCTION` (`true` for production API/Sheets mode, otherwise LocalStorage mode)

### Google Sheets (server-side, production)

- `GOOGLE_SHEETS_ID`
- `GOOGLE_SERVICE_ACCOUNT_KEY` or `GOOGLE_SERVICE_ACCOUNT`

### Player registration form (public)

- `NEXT_PUBLIC_FORM_URL`
- `NEXT_PUBLIC_FORM_FIELD_LEAGUE_ID`
- `NEXT_PUBLIC_FORM_FIELD_SEASON_ID`

> Note: only `NEXT_PUBLIC_*` vars are exposed to the browser.  
> Google Sheets credentials must remain server-only (no `NEXT_PUBLIC_` prefix).

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure `.env.local` (see variables above).

3. Run dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Key Features

### Public / Viewer Features

- Multi-league home view with quick league access
- League overview with:
  - Live standings table
  - Top scorers leaderboard
  - Top assists leaderboard
  - Player of the season summary
  - Recent/featured match cards
- Full fixtures and results by league + season
- Game detail pages with:
  - Scoreline and status (`scheduled`, `live`, `completed`)
  - Per-player stat events (goals, assists, etc.)
- Team pages with:
  - Team summary
  - Team-specific matches
  - Team squad views
  - Team standings context
- Player pages with:
  - Player profile card
  - Aggregated stat rows
  - League/team context
- Global pages for browsing games, players, and teams
- Season switching across league pages
- Mobile-first UX (bottom navigation, compact cards, tabbed sections)
- Dark/light theme support

### Admin / Manage Features

- Access-code protected manage flows
- League management:
  - Update league info
  - Regenerate/copy access code
  - Delete league
- Season management:
  - Create/add seasons
  - Track season context in admin screens
- Game management:
  - Create fixtures
  - Update score/status (including live updates)
  - Delete games
- Player management:
  - Search players (prioritized: in-this-league first, then other players)
  - Assign players to teams
  - Reactivate inactive league-player entries when reassigning
  - Remove players from active squad (preserving stat history)
  - Team-by-team active squad display
- Stats management:
  - Add/remove match stats
  - Stat type support and stat summaries
- Registration tooling:
  - League+season prefilled Google Form URL generation
  - Copy link + open form actions
  - QR code for easy phone registration

### Data / Platform Features

- Dual data backend:
  - LocalStorage mode for testing/dev
  - Google Sheets mode for production
- Repository pattern with swappable implementations (`localStorage` / `sheets`)
- API route boundary for server-only credential usage
- React Query caching with tuned stale times per domain
- Live game auto-refetch behavior for near real-time score visibility

## Routes

- `/` - Home (league list)
- `/[leagueId]` - League overview
- `/[leagueId]/games` - Fixtures/results
- `/[leagueId]/games/[gameId]` - Game detail
- `/[leagueId]/players` - League players
- `/[leagueId]/players/[playerId]` - Player profile
- `/[leagueId]/teams` - Teams/standings
- `/[leagueId]/teams/[teamId]` - Team detail
- `/manage` - Admin code entry
- `/manage/[leagueId]` - Admin dashboard

## Project Structure

```text
src/
  app/             # Next.js pages + API routes
  components/      # UI components
  hooks/           # React Query hooks
  core/            # Domain interfaces + pure business logic
  infrastructure/  # Repository implementations (localStorage/sheets)
  lib/             # Shared client utilities (api client, helpers)
```

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production build
- `npm run test` - unit tests
- `npm run lint` - ESLint

## Architecture Notes

- `core/` is framework-agnostic and reusable.
- `infrastructure/` provides interchangeable repository backends.
- `container.ts` (client) and `container.server.ts` (server) enforce separation of client/public vs server/secret concerns.
