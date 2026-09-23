# Rise90

**Rise90** is a private, authenticated personal operating system for a 90-day discipline challenge. The application records daily Web Development, LeetCode, and Gym progress, then turns the stored records into a cumulative performance chart, streaks, analytics, contribution calendar, journal, and data exports.

The application is built as a full-stack React and TypeScript application. It uses Manus OAuth for private access, tRPC for type-safe procedures, Drizzle ORM with a MySQL/TiDB-compatible database, Tailwind CSS for the interface, and Recharts for the live visualizations.

## Project structure

| Location | Purpose |
| --- | --- |
| `client/src/pages/` | Dashboard, calendar, analytics, focus, journal, and settings screens. |
| `client/src/components/` | Shared layout, daily editor, progress chart, calendar, rings, and challenge-start components. |
| `client/src/lib/tracker.ts` | Client-side view-model helpers that transform persisted state into dashboard data. |
| `shared/tracker.ts` | Central, deterministic 90-day date, score, streak, weekly, and chart calculations. |
| `drizzle/schema.ts` | Database tables, indexes, and foreign-key definitions. |
| `drizzle/0000_fluffy_molten_man.sql` | Initial generated database migration. |
| `server/db.ts` | Database access helpers and transactional-style daily-record persistence operations. |
| `server/routers.ts` | Protected tRPC procedures for tracker state, daily saving, settings, export, reset, and deletion. |
| `server/tracker.test.ts` | Calculation unit tests. |

## Database schema

The database maintains an authenticated `users` identity table supplied by the app template. A user can own several historical challenges, though exactly one challenge is active at a time. Removing a challenge cascades safely to its daily records and associated logs.

| Table | Key fields | Role |
| --- | --- | --- |
| `users` | `id`, `openId`, `email`, `role` | Manus OAuth identity. |
| `challenges` | `userId`, `startDate`, `endDate`, `leetcodeTarget`, `status` | One 90-day program and its configurable daily target. |
| `dailyProgress` | `challengeId`, `date`, completion flags, counts, minutes, journal | One unique record per challenge date. |
| `leetcodeProblems` | `dailyProgressId`, difficulty, URL, notes, completion | Optional individual problem records. |
| `webDevLogs` | `dailyProgressId`, topic, project, notes | Optional Web Development detail. |
| `gymLogs` | `dailyProgressId`, workout type, exercises, notes | Optional Gym detail. |

The schema enforces a unique `(challengeId, date)` daily record and foreign-key cascades for every detailed log. The challenge status index and daily-date index support the normal dashboard and historical-calendar queries.

## Environment template

Use [`ENVIRONMENT_TEMPLATE.md`](./ENVIRONMENT_TEMPLATE.md) to populate an untracked local `.env` file or your deployment provider’s secret manager. Do **not** commit real values. In the managed project, OAuth and database values are injected automatically.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL/TiDB connection string used by Drizzle. |
| `JWT_SECRET` | Secure cookie/session signing value. |
| `VITE_APP_ID` | OAuth application identifier. |
| `OAUTH_SERVER_URL` | OAuth server base URL. |
| `VITE_OAUTH_PORTAL_URL` | Browser login portal URL. |
| `OWNER_OPEN_ID` | Owner identifier used for the default administrative role. |

## Local development

Install Node.js 22+ and pnpm 10+ before running the application. Install dependencies, set local environment values, run the migration, then start the development server.

```bash
pnpm install
# Create an untracked .env file using ENVIRONMENT_TEMPLATE.md
pnpm drizzle-kit migrate
pnpm dev
```

The development server starts through `server/_core/index.ts` and serves the React client with its tRPC API under `/api/trpc`. Run the following validation commands before release.

```bash
pnpm check
pnpm test
pnpm build
```

## Database migration instructions

The initial migration is stored at `drizzle/0000_fluffy_molten_man.sql`. On a clean database, Drizzle will create the tables, foreign keys, and indexes through the migration command below.

```bash
pnpm drizzle-kit migrate
```

When evolving the schema, edit `drizzle/schema.ts`, generate a new migration, review its SQL, and apply it using the project database migration process.

```bash
pnpm drizzle-kit generate
# Review the newly generated SQL in drizzle/
pnpm drizzle-kit migrate
```

Avoid destructive schema commands on a database containing real progress records. Export a backup before any destructive migration.

## Progress and streak logic

Every daily record has a maximum of three points. Web Development earns one point when marked complete. LeetCode earns one point when `leetcodeCount` meets or exceeds the configured daily target. Gym earns one point when marked complete.

> `dailyScore = webDevCompleted + (leetcodeCount >= leetcodeTarget) + gymCompleted`

A **successful day** is exactly `3/3`. A partial day is `1/3` or `2/3`, and a missed day is `0/3`. The current and longest streaks both count only consecutive successful days. A partial or missed day resets the active streak.

The cumulative performance chart is deliberately different from elapsed-calendar progress. For each visible challenge day, the application divides all earned points so far by all points that were available through that day. The prominent line therefore measures actual consistency rather than simply how much calendar time has passed.

> `cumulativePerformance = totalPointsEarnedToDate / (elapsedDays × 3) × 100`

The secondary ideal line is a simple reference pace from Day 1 to Day 90. Weekly values use the same daily score and group available days into 7-day blocks.

## Security and data behavior

All tracker procedures are protected by the application’s OAuth session. The server validates inputs with Zod, rejects future-day saves, rejects dates outside the active challenge, and relies on the unique database key to prevent duplicate daily records. Database credentials remain server-side; no client source includes database secrets.

The settings screen distinguishes **Reset current challenge**, which clears only the active challenge and its cascade-owned progress, from **Delete all data**, which removes all challenges belonging to the authenticated user. Both require an explicit confirmation click. The export action obtains protected tracker data and produces CSV and JSON downloads in the browser.

## Production deployment

Build the app with `pnpm build`, provide the required environment variables through your deployment platform’s secret manager, apply migrations to the production database, and run the generated Node entry point.

```bash
pnpm build
NODE_ENV=production node dist/index.js
```

When using the managed project, create a checkpoint and use the platform’s Publish control. It provides managed hosting, OAuth integration, and database environment injection without placing sensitive values in source control.

## Validation status

Type checking, production build, database-table/foreign-key inspection, and six unit tests pass in the delivered project. Desktop and mobile visual checks cover the configured challenge-start experience. Full authenticated browser flow verification depends on a signed-in user session; the code paths are implemented, and the manual acceptance path is outlined below.

| Acceptance flow | Expected result |
| --- | --- |
| Start challenge | An active challenge is created with a start date and LeetCode target. |
| Save daily record | Goals, logs, journal, and problem list persist and refresh charts. |
| Complete 3/3 day | A perfect-day notice appears; milestone streaks receive concise feedback. |
| Refresh page | Saved records, calendar intensity, analytics, and streaks remain available. |
| Export | Protected state is requested, then both CSV and JSON files download. |
| Reset/delete | Confirmation is required before active-only reset or permanent full deletion. |
