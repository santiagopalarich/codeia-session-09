-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- PROFILES for user information (if not exists)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- TEAMS table
create table if not exists public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references public.profiles(id)
);

-- TEAM MEMBERS table
create table if not exists public.team_members (
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member', -- 'admin', 'member'
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (team_id, user_id)
);

-- Add new columns to TODOS
alter table public.todos 
add column if not exists team_id uuid references public.teams(id) on delete set null,
add column if not exists assignee_id uuid references public.profiles(id) on delete set null, -- Responsable de ejecución
add column if not exists responsible_id uuid references public.profiles(id) on delete set null, -- Responsable (Accountable)
add column if not exists deadline timestamp with time zone;

-- RLS Policies (Basic)
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone" 
  on public.profiles for select using ( true );

create policy "Users can insert their own profile" 
  on public.profiles for insert with check ( auth.uid() = id );

create policy "Users can update own profile" 
  on public.profiles for update using ( auth.uid() = id );

-- Policies for Teams (Simplified: visible to members or public for now to simplify dev)
create policy "Teams are viewable by authenticated users" 
  on public.teams for select using ( auth.role() = 'authenticated' );

create policy "Authenticated users can create teams" 
  on public.teams for insert with check ( auth.role() = 'authenticated' );

-- Policies for Team Members
create policy "Team members viewable by authenticated users" 
  on public.team_members for select using ( auth.role() = 'authenticated' );

create policy "Team members logic" 
  on public.team_members for insert with check ( auth.role() = 'authenticated' );

-- Trigger to create profile on sign up (Standard Supabase)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error on recreation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
