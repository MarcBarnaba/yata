-- GSD cloud sync schema.
-- Run once in the Supabase SQL Editor (Dashboard → SQL → New query).
--
-- Model: one key→jsonb blob per user, mirroring the local persistence adapter
-- (keys: items, projects, contexts, tags, reviews, settings). Simple, robust,
-- and enough for a single-user app; per-record merging happens client-side.

create table if not exists public.app_state (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  key        text        not null,
  data       jsonb       not null,
  source     text,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Row Level Security: every user can only touch their own rows.
alter table public.app_state enable row level security;

drop policy if exists "app_state_select_own" on public.app_state;
drop policy if exists "app_state_insert_own" on public.app_state;
drop policy if exists "app_state_update_own" on public.app_state;
drop policy if exists "app_state_delete_own" on public.app_state;

create policy "app_state_select_own" on public.app_state
  for select using (auth.uid() = user_id);

create policy "app_state_insert_own" on public.app_state
  for insert with check (auth.uid() = user_id);

create policy "app_state_update_own" on public.app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "app_state_delete_own" on public.app_state
  for delete using (auth.uid() = user_id);

-- Enable realtime so other devices receive changes live.
-- (Safe to run once; errors if the table is already in the publication.)
alter publication supabase_realtime add table public.app_state;
