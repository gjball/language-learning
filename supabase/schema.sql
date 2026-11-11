-- Round robin: database setup for Supabase.
--
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste
-- this whole file -> Run. It is safe to run again.
--
-- Also turn on guest sign-in: Authentication -> Sign In / Providers ->
-- "Allow anonymous sign-ins".

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  -- Short code students type to join.
  code text not null unique,
  host_id uuid not null default auth.uid(),
  status text not null default 'lobby' check (status in ('lobby', 'playing', 'finished')),

  -- Settings chosen by the host.
  level text not null,
  categories text[] not null,
  round_minutes integer not null check (round_minutes > 0),
  round_count integer not null check (round_count > 0),
  auto_advance boolean not null default false,

  -- Live state while playing.
  round integer not null default 0,
  stage text not null default 'discussion' check (stage in ('changeover', 'discussion')),
  -- The timer is running when ends_at is set, and paused (showing
  -- remaining_ms) when it is null.
  ends_at timestamptz,
  remaining_ms integer,
  -- Who is taking part in the current round: [{ "id": ..., "name": ... }].
  roster jsonb not null default '[]'::jsonb,
  -- Shuffles the questions differently for every session.
  seed integer not null default 0,

  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  name text not null check (char_length(name) between 1 and 40),
  joined_at timestamptz not null default now(),
  unique (session_id, user_id)
);

create index if not exists participants_session_id_idx on public.participants (session_id);

-- Row level security: everyone signed in (guests included) can read; only the
-- host can change a session; students can only add or change themselves.
alter table public.sessions enable row level security;
alter table public.participants enable row level security;

drop policy if exists "Signed-in users can read sessions" on public.sessions;
create policy "Signed-in users can read sessions"
  on public.sessions for select to authenticated
  using (true);

drop policy if exists "Users can create their own sessions" on public.sessions;
create policy "Users can create their own sessions"
  on public.sessions for insert to authenticated
  with check (host_id = auth.uid());

drop policy if exists "Hosts can update their sessions" on public.sessions;
create policy "Hosts can update their sessions"
  on public.sessions for update to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

drop policy if exists "Signed-in users can read participants" on public.participants;
create policy "Signed-in users can read participants"
  on public.participants for select to authenticated
  using (true);

drop policy if exists "Users can join as themselves" on public.participants;
create policy "Users can join as themselves"
  on public.participants for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users can rename themselves" on public.participants;
create policy "Users can rename themselves"
  on public.participants for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can leave and hosts can remove" on public.participants;
create policy "Users can leave and hosts can remove"
  on public.participants for delete to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.sessions s
      where s.id = participants.session_id and s.host_id = auth.uid()
    )
  );

grant select, insert, update on public.sessions to authenticated;
grant select, insert, update, delete on public.participants to authenticated;

-- Live updates: send changes to connected phones as they happen.
alter table public.participants replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sessions'
  ) then
    alter publication supabase_realtime add table public.sessions;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'participants'
  ) then
    alter publication supabase_realtime add table public.participants;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Questions
-- ---------------------------------------------------------------------------
-- Each question belongs to a level (A1-C2) and a topic. The teacher chooses
-- the level and topics when hosting a session.
--
-- Edit these in the Supabase dashboard: Table Editor -> questions. You can add,
-- change or delete rows there, or import a CSV file with the columns
-- level, topic, text. Set "active" to false to hide a question without
-- deleting it. The app reads the list when it opens.

create table if not exists public.questions (
  id bigint generated by default as identity primary key,
  level text not null check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  topic text not null check (char_length(topic) between 1 and 60),
  text text not null check (char_length(text) between 1 and 500),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists questions_level_topic_idx on public.questions (level, topic);

-- Anyone using the app can read questions; they can only be changed from the
-- Supabase dashboard.
alter table public.questions enable row level security;

drop policy if exists "Anyone can read questions" on public.questions;
create policy "Anyone can read questions"
  on public.questions for select to anon, authenticated
  using (true);

grant select on public.questions to anon, authenticated;

-- Starter questions, added only if the table is empty.
insert into public.questions (level, topic, text)
select * from (values
  ('A1', 'Daily life', 'What do you usually eat for breakfast?'),
  ('A1', 'Daily life', 'Who is in your family?'),
  ('A1', 'Travel', 'Which city or town are you from? What is it like?'),
  ('A1', 'Travel', 'How do you get to class?'),
  ('A1', 'Work & study', 'What is your job, or what do you study?'),
  ('A1', 'Work & study', 'What time do you start work or school?'),
  ('A1', 'Opinions', 'What is your favourite food? Why do you like it?'),
  ('A1', 'Opinions', 'Do you like cats or dogs more?'),
  ('A2', 'Daily life', 'What did you do last weekend?'),
  ('A2', 'Daily life', 'Describe your typical day from morning to night.'),
  ('A2', 'Travel', 'Tell your partner about a trip you enjoyed.'),
  ('A2', 'Travel', 'What do you always take with you when you travel?'),
  ('A2', 'Work & study', 'What was your favourite subject at school? Why?'),
  ('A2', 'Work & study', 'What are you going to do after this class?'),
  ('A2', 'Opinions', 'Is it better to live in a city or in the countryside?'),
  ('A2', 'Opinions', 'What makes a good friend?'),
  ('B1', 'Daily life', 'How has your daily routine changed in the last five years?'),
  ('B1', 'Daily life', 'What do you do to relax after a stressful day?'),
  ('B1', 'Travel', 'If you could visit any country next month, where would you go and why?'),
  ('B1', 'Travel', 'Describe a time when something went wrong on a journey.'),
  ('B1', 'Work & study', 'What would your ideal job be like?'),
  ('B1', 'Work & study', 'What is the most useful thing you have ever learned?'),
  ('B1', 'Opinions', 'Do people spend too much time on their phones?'),
  ('B1', 'Opinions', 'Should children have homework every day?'),
  ('B2', 'Daily life', 'Which habit would you most like to change, and what has stopped you so far?'),
  ('B2', 'Daily life', 'How do you balance what you have to do with what you want to do?'),
  ('B2', 'Travel', 'Does tourism do more good or more harm to the places people visit?'),
  ('B2', 'Travel', 'Would you rather travel alone or with others? What are the trade-offs?'),
  ('B2', 'Work & study', 'Is working from home better for employees, for employers, or for neither?'),
  ('B2', 'Work & study', 'What skills will matter most at work in ten years?'),
  ('B2', 'Opinions', 'Should voting be compulsory?'),
  ('B2', 'Opinions', 'Is it ever acceptable to tell a lie?'),
  ('C1', 'Daily life', 'To what extent do the things we own shape who we are?'),
  ('C1', 'Daily life', 'How has the meaning of "community" changed in your lifetime?'),
  ('C1', 'Travel', 'Can you really understand a culture without speaking its language?'),
  ('C1', 'Travel', 'Is the idea of "authentic" travel a myth?'),
  ('C1', 'Work & study', 'Should universities prepare people for jobs or teach them how to think?'),
  ('C1', 'Work & study', 'What are the hidden costs of a culture that glorifies being busy?'),
  ('C1', 'Opinions', 'Where should the line be drawn between free speech and causing harm?'),
  ('C1', 'Opinions', 'Is economic growth compatible with protecting the environment?'),
  ('C2', 'Daily life', 'Is convenience eroding our capacity for patience, and does it matter if it is?'),
  ('C2', 'Daily life', 'In what ways do everyday rituals quietly hold a society together?'),
  ('C2', 'Travel', 'Does ease of travel homogenise the world or deepen our appreciation of difference?'),
  ('C2', 'Travel', 'Is there an ethical obligation to stay away from fragile destinations?'),
  ('C2', 'Work & study', 'If machines could do all necessary work, what would give human effort its value?'),
  ('C2', 'Work & study', 'Is meritocracy an achievable ideal or a comforting fiction?'),
  ('C2', 'Opinions', 'Can moral progress be measured, and if so, by whose standards?'),
  ('C2', 'Opinions', 'Are we responsible for the unintended consequences of our good intentions?')
) as starter (level, topic, text)
where not exists (select 1 from public.questions);
