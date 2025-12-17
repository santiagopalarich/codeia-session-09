-- Projects table
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  color text default '#808080',
  created_at timestamp with time zone default timezone('utc'::text, now()),
  created_by uuid references public.profiles(id)
);

-- RLS for Projects
alter table public.projects enable row level security;

create policy "Authenticated users can view projects" 
  on public.projects for select using ( auth.role() = 'authenticated' );

create policy "Authenticated users can insert projects" 
  on public.projects for insert with check ( auth.role() = 'authenticated' );

-- Add project_id to todos
alter table public.todos 
add column if not exists project_id uuid references public.projects(id) on delete set null;

-- Seed initial projects (Optional, mimicking the mock data)
-- We use a do block to insert effectively if empty
do $$
declare
  user_id uuid;
begin
  -- Try to get the first user id available (just for seeding if running manually, 
  -- in real app created_by comes from auth.uid())
  -- This part is tricky in pure SQL without specific context, 
  -- but we can skip 'created_by' enforcement if RLS allows or insert with a placeholder if needed.
  -- For now, let's just create the table structure.
end $$;
