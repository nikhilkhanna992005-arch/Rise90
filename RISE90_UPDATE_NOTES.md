# Rise90 update notes

This update preserves the existing authenticated 90-day tracker, daily progress persistence, analytics calculations, calendar, journal, settings, and export flows while extending the product toward the supplied Rise90 specification.

## Included changes

- Rebranded the authenticated shell and document title from 90 Day Grind to Rise90.
- Added a polished public landing page for unauthenticated visitors with Rise90 messaging, product preview, and sign-in CTAs.
- Reworked navigation around Dashboard, Goals, Journey, Analytics, Achievements, Profile, and Settings while retaining the existing focused tracker routes.
- Added a personalized Goals experience with creation, category, target type, frequency, priority, partial progress, completion states, and archiving.
- Goal metadata and custom check-ins are stored in browser local storage under a user-and-challenge-scoped key so one signed-in user does not mix local goal data with another user.
- Added Achievements based on actual challenge progress and streak calculations.
- Added Profile with challenge summary and a documented Rise Score based on completion, consistency, streak energy, and goal difficulty.
- Enhanced the dashboard with Rise Score, personalized-goal snapshots, honest insight messaging, and clearer links into the new areas.
- Enhanced Analytics with goal-level performance, data-aware focus insights, weekly performance, and meaningful empty states.

## Verification

The following commands pass in the supplied project:

```bash
pnpm check
pnpm test
pnpm build
```

The backend tracker remains protected by the existing Manus authentication flow and user-scoped database queries. The new local goal layer is intentionally additive, allowing the existing server-backed fixed Web Development, LeetCode, and Gym progress history to remain intact while goal architecture can be migrated to first-class database tables in a later iteration.
