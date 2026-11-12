-- Run once in Supabase SQL Editor after creating the project.
-- Invite approved users in Supabase Auth first. Then add each user's Auth UUID below:
-- insert into public.project_members (project_id, user_id, role)
-- values ('hkdw-2027', 'USER-UUID-FROM-AUTH', 'member');
create table if not exists public.project_workspace_data (
  project_id text not null,
  record_key text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  primary key (project_id, record_key)
);

create table if not exists public.project_members (
  project_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  primary key (project_id, user_id)
);

alter table public.project_members enable row level security;
revoke all on public.project_members from anon;
grant select on public.project_members to authenticated;
drop policy if exists "users can view their own project memberships" on public.project_members;
create policy "users can view their own project memberships"
  on public.project_members for select to authenticated using (user_id = auth.uid());

alter table public.project_workspace_data enable row level security;
revoke all on public.project_workspace_data from anon;
grant select, insert, update on public.project_workspace_data to authenticated;

drop policy if exists "authenticated project members can read workspace data" on public.project_workspace_data;
create policy "authenticated project members can read workspace data"
  on public.project_workspace_data for select to authenticated using (
    exists (select 1 from public.project_members m where m.project_id = project_workspace_data.project_id and m.user_id = auth.uid())
  );

drop policy if exists "authenticated project members can insert workspace data" on public.project_workspace_data;
create policy "authenticated project members can insert workspace data"
  on public.project_workspace_data for insert to authenticated with check (
    exists (select 1 from public.project_members m where m.project_id = project_workspace_data.project_id and m.user_id = auth.uid())
  );

drop policy if exists "authenticated project members can update workspace data" on public.project_workspace_data;
create policy "authenticated project members can update workspace data"
  on public.project_workspace_data for update to authenticated using (
    exists (select 1 from public.project_members m where m.project_id = project_workspace_data.project_id and m.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.project_members m where m.project_id = project_workspace_data.project_id and m.user_id = auth.uid())
  );

create index if not exists project_workspace_data_updated_at_idx on public.project_workspace_data (updated_at desc);
