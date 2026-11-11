# Round robin

A conversation-practice app for language classes. Students are paired up, given
a question to discuss, and rotated to a new partner each round on a timer.

Built with Expo (React Native + TypeScript). It runs as a web app now and can
be built for Android and iOS later.

## Two ways to run a session

- **Phones (like Kahoot):** the teacher hosts a session and gets a 6-digit join
  code. Students enter the code on their own phones and see their partner, the
  question and the timer.
- **One shared screen:** the teacher types in the students and shows the
  pairings on a single screen. Needs no setup.

## Run it

```bash
npm install
npx expo start
```

Press `w` for the web version, or scan the QR code with Expo Go.

## Setting up phone sessions (one time)

Phone sessions need a free [Supabase](https://supabase.com) project so the
phones can see the same session.

1. Create a project at supabase.com.
2. In the dashboard open **SQL Editor**, paste in the contents of
   `supabase/schema.sql`, and run it.
3. Open **Authentication → Sign In / Providers** and turn on
   **Allow anonymous sign-ins** (this is the guest ID students get).
4. Copy `.env.example` to `.env` and fill in the project URL and the
   publishable key from **Project Settings → API Keys**.
5. Restart `npx expo start`.

## Where things are

- The `weeks` table in Supabase — the syllabus: 16 weeks per level, each with a
  topic and a grammar focus. Edit it under **Table Editor → weeks**.
- The `questions` table in Supabase — the question bank (columns: `level`,
  `week`, `text`). Questions with no week are general questions for the level.
- `src/data/weeks.ts` and `src/data/questions.ts` — built-in drafts, used when
  the database is not set up.
- `src/lib/round-robin.ts` — who is paired with whom each round.
- `src/lib/live-session.ts` — phone sessions (talks to Supabase).
- `src/app/` — the pages: start page, host setup, session, single screen.
- `supabase/schema.sql` — database tables and access rules.
