-- RUN THIS IN SUPABASE SQL EDITOR TO FIX DATA VISIBILITY

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Tables for Teams/Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references public.profiles(id)
);

create table if not exists public.team_members (
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (team_id, user_id)
);

-- 3. CRITICAL: Backfill Profiles for existing users
-- This ensures you can be assigned to tasks
insert into public.profiles (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name'
from auth.users
on conflict (id) do nothing;

-- 4. Add new columns to Todos (this fixes the "missing tasks" error)
alter table public.todos 
add column if not exists team_id uuid references public.teams(id) on delete set null,
add column if not exists assignee_id uuid references public.profiles(id) on delete set null,
add column if not exists responsible_id uuid references public.profiles(id) on delete set null,
add column if not exists deadline timestamp with time zone,
add column if not exists status text default 'todo';

-- 5. Data Migration: Ensure old tasks have valid status
update todos set status = 'done' where is_completed = true and (status is null or status = 'todo');
update todos set status = 'todo' where is_completed = false and (status is null);
update todos set status = 'todo' where status is null;

-- 6. Security Policies (Basic)
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.profiles enable row level security;

-- Drop to recreate to avoid errors
drop policy if exists "Public profiles" on public.profiles;
create policy "Public profiles" on public.profiles for select using (true);

drop policy if exists "Public teams" on public.teams;
create policy "Public teams" on public.teams for select using (true);

drop policy if exists "Public members" on public.team_members;
create policy "Public members" on public.team_members for select using (true);

-- Insert policies for authenticated users to create/edit
drop policy if exists "Auth insert teams" on public.teams;
create policy "Auth insert teams" on public.teams for insert with check (auth.role() = 'authenticated');

drop policy if exists "Auth update own profile" on public.profiles;
create policy "Auth update own profile" on public.profiles for update using (auth.uid() = id);
