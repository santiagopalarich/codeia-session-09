-- Fix RLS: Allow authenticated users to manage team members
alter table public.team_members enable row level security;

-- Allow INSERT (Add member)
drop policy if exists "Auth insert team members" on public.team_members;
create policy "Auth insert team members" 
on public.team_members 
for insert 
with check (auth.role() = 'authenticated');

-- Allow DELETE (Remove member)
drop policy if exists "Auth delete team members" on public.team_members;
create policy "Auth delete team members" 
on public.team_members 
for delete 
using (auth.role() = 'authenticated');
