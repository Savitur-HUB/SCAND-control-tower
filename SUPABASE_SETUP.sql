-- SCAND CONTROL TOWER V6: private workspace for up to ~5 trusted users
-- Execute in Supabase Dashboard > SQL Editor as project owner.
-- IMPORTANT: Auth > Users: create/invite users and add UUIDs to scand_members.
-- These RLS rules block everyone except explicitly approved member IDs.

create table if not exists public.scand_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check(role in ('editor','admin')),
  created_at timestamptz not null default now()
);
alter table public.scand_members enable row level security;

drop policy if exists "members can see themselves" on public.scand_members;
create policy "members can see themselves" on public.scand_members
  for select to authenticated using (user_id = auth.uid());

create table if not exists public.scand_workspace (
  id smallint primary key check (id=1),
  version bigint not null default 0,
  data jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);
alter table public.scand_workspace enable row level security;

-- One shared JSON document; compare-and-swap via version in the API.
-- A single row avoids partial multi-entity writes in the first small-team pilot.
insert into public.scand_workspace (id,version,data)
values (1,0,'{"trucks":[],"trips":[],"logs":[]}'::jsonb)
on conflict (id) do nothing;

drop policy if exists "team read workspace" on public.scand_workspace;
create policy "team read workspace" on public.scand_workspace
  for select to authenticated using (
    exists (select 1 from public.scand_members m where m.user_id=auth.uid())
  );

drop policy if exists "team update workspace" on public.scand_workspace;
create policy "team update workspace" on public.scand_workspace
  for update to authenticated using (
    exists (select 1 from public.scand_members m where m.user_id=auth.uid())
  ) with check (
    exists (select 1 from public.scand_members m where m.user_id=auth.uid())
  );

-- Optional push updates: if not enabled, 15-second polling still works.
-- Enable `scand_workspace` for Realtime via Dashboard > Database > Publications.

-- AFTER users are invited/created in Supabase Auth > Users, run this for EACH user:
-- insert into public.scand_members (user_id, role)
-- values ('00000000-0000-0000-0000-000000000000'::uuid, 'editor')
-- on conflict (user_id) do update set role=excluded.role;
-- Replace the zero UUID with the user's real Auth UUID. Never paste passwords here.
