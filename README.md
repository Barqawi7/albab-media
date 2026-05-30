# BAB Dashboard

Internal business OS for albab media — a UAE media / influencer / marketing agency.

Next.js 14 (Pages Router) + Supabase. Single dashboard with 18 rooms grouped in a sidebar.

## Stack

- **Frontend:** Next.js 14.2 (Pages Router), React 18, plain inline-style theming.
- **Backend:** Supabase Postgres + RLS (default-deny, `authenticated`-only policies).
- **Auth:** Supabase Auth (Google provider) for the dashboard itself; separate Google OAuth (token cookies) for the Gmail room.
- **AI:** Anthropic Messages API proxied via `/api/ai/chat` (server-side).

## Repo layout

```
pages/
  [[...slug]].jsx    catch-all → renders the matching room from the registry
  api/auth/          OAuth for the Gmail integration
  api/gmail/         Gmail list / read / send
  api/ai/chat.js     Anthropic proxy for AI Assistant
components/
  Shell.jsx          sidebar + main pane
  Sidebar.jsx        room navigation
  AuthGate.jsx       gate that forces a Supabase session
  rooms/
    registry.js      source of truth for rooms + slugs + sidebar order
    _RoomShell.jsx   schema-driven table+drawer used by most rooms
    Home.jsx         dashboard
    Influencers.jsx  bespoke (tabbed comprehensive/focused with promote action)
    …each room…
lib/
  supabase.js        anon client
  theme.js           color tokens
supabase/migrations/ idempotent SQL — paste into Supabase SQL Editor
legacy/index.jsx     pre-rebuild monolith (kept for reference, not routed)
```

## Setup

1. Clone and install:
   ```sh
   git clone https://github.com/Barqawi7/albab-media.git
   cd albab-media
   npm install
   ```

2. Create `.env.local`:
   ```env
   # Supabase (required)
   NEXT_PUBLIC_SUPABASE_URL=https://dvklqmoddcqbisnbknsj.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>

   # Gmail room (optional)
   GOOGLE_CLIENT_ID=<from Google Cloud OAuth>
   GOOGLE_CLIENT_SECRET=<from Google Cloud OAuth>
   NEXTAUTH_URL=http://localhost:3000   # or your deployed origin

   # AI Assistant (optional)
   ANTHROPIC_API_KEY=<from console.anthropic.com>
   ```

3. Apply database schema. In the Supabase SQL Editor, paste **`supabase/migrations/_round2_combined.sql`** and run it. Everything is idempotent so re-runs are safe.

4. `npm run dev` → http://localhost:3000

## Deploying to Vercel

1. Push `main` to GitHub (already wired to `https://github.com/Barqawi7/albab-media`).
2. Import the repo into Vercel; Vercel auto-detects Next.js.
3. Set the same env vars from `.env.local` in **Project Settings → Environment Variables**. For Gmail, update `NEXTAUTH_URL` to the deployed origin and add `<origin>/api/auth/callback` to the Google OAuth redirect URIs.
4. Deploy.

## Rooms

| Group | Room | Table(s) |
| --- | --- | --- |
| Workspace | Home | (aggregates counts/recents) |
| Business | Sales | `sales_deals`, `sales_quotations` |
| Business | Finance | `finance_money`, `finance_expenses` |
| Business | Clients | `clients` |
| People | Influencers | `influencers_comprehensive`, `influencers_focused` |
| People | Models | `models` |
| People | Connections | `connections` |
| Content & Marketing | Marketing | `marketing_updates` |
| Content & Marketing | Social Algorithm | `social_algorithm_notes` |
| Content & Marketing | Content | `content` |
| Content & Marketing | Events | `events` |
| Content & Marketing | Quick Comments | `quick_comments` |
| Comms | Gmail | (Gmail API) |
| Comms | AI Assistant | `ai_conversations` |
| Personal | Tasks | `tasks` |
| Personal | Ideas | `ideas` |
| Personal | Maps | `map_locations` |
| Personal | Life | `life_areas` |

## Adding a new room

1. Add a row in `components/rooms/registry.js` with `{ slug, label, component }`.
2. If it's a simple CRUD room, copy any of `Clients.jsx` / `Tasks.jsx` as a starting point and feed `RoomShell` a field schema + column config.
3. If it needs schema changes, add a new `supabase/migrations/NNNN_*.sql` (always idempotent), append it to `_round2_combined.sql`, and paste the new SQL into the Supabase SQL Editor.
