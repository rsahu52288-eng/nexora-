-- ==============================================================================
-- NEXORA - Next-Gen Cloud Storage Database Schema & Storage Policies (Supabase)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Extends Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  bio text,
  role text default 'user', -- 'user', 'admin'
  plan text default 'Free Plan', -- 'Free Plan', 'Pro Plan', 'Enterprise'
  storage_used bigint default 0, -- In bytes
  storage_quota bigint default 107374182400, -- In bytes (100 GB default)
  two_factor_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger to create profile upon new auth user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role, plan, storage_used, storage_quota)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
    'user',
    'Free Plan',
    0,
    107374182400 -- 100 GB
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Files Table
create table if not exists public.files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  size bigint not null, -- compressed/stored size
  original_size bigint not null, -- uncompressed size
  type text not null, -- e.g. 'PDF', 'PPTX', 'Image', 'ZIP', 'Video', 'Audio', 'Document'
  mime_type text not null,
  hash text not null, -- SHA-256 hash of the content
  encryption_algorithm text default 'AES-256-GCM',
  is_compressed boolean default true,
  compression_ratio numeric(5,2) default 0,
  chunks_count integer default 1,
  storage_path text not null,
  status text default 'active', -- 'active', 'trash', 'archived'
  is_shared boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.files enable row level security;

drop policy if exists "Users can view their own files" on public.files;
create policy "Users can view their own files"
  on public.files for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own files" on public.files;
create policy "Users can insert their own files"
  on public.files for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own files" on public.files;
create policy "Users can update their own files"
  on public.files for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own files" on public.files;
create policy "Users can delete their own files"
  on public.files for delete
  using (auth.uid() = user_id);

-- 3. File Chunks Table
create table if not exists public.file_chunks (
  id uuid default gen_random_uuid() primary key,
  file_id uuid references public.files(id) on delete cascade not null,
  chunk_index integer not null,
  chunk_hash text not null,
  chunk_size bigint not null,
  storage_path text not null,
  created_at timestamptz default now()
);

alter table public.file_chunks enable row level security;

drop policy if exists "Users can access chunks of their own files" on public.file_chunks;
create policy "Users can access chunks of their own files"
  on public.file_chunks for all
  using (
    exists (
      select 1 from public.files
      where files.id = file_chunks.file_id and files.user_id = auth.uid()
    )
  );

-- 4. Shared Files Table
create table if not exists public.shared_links (
  id uuid default gen_random_uuid() primary key,
  file_id uuid references public.files(id) on delete cascade not null,
  owner_id uuid references auth.users(id) on delete cascade not null,
  shared_with_email text,
  access_level text default 'view',
  share_token text unique not null,
  expires_at timestamptz,
  created_at timestamptz default now()
);

alter table public.shared_links enable row level security;

drop policy if exists "Owners manage shared links" on public.shared_links;
create policy "Owners manage shared links"
  on public.shared_links for all
  using (auth.uid() = owner_id);

drop policy if exists "Users can access files shared with them" on public.shared_links;
create policy "Users can access files shared with them"
  on public.shared_links for select
  using (
    auth.uid() = owner_id or 
    shared_with_email = (select email from auth.users where id = auth.uid()) or
    shared_with_email is null
  );

-- 5. Activity Logs Table
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  action text not null, -- 'Upload', 'Login', 'Delete', 'Share', 'Security', 'Download'
  description text not null,
  file_name text,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

alter table public.activity_logs enable row level security;

drop policy if exists "Users can view their activity logs" on public.activity_logs;
create policy "Users can view their activity logs"
  on public.activity_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their activity logs" on public.activity_logs;
create policy "Users can insert their activity logs"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);

-- 6. Notifications Table
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users manage their own notifications" on public.notifications;
create policy "Users manage their own notifications"
  on public.notifications for all
  using (auth.uid() = user_id);

-- ==============================================================================
-- 7. Supabase Storage Bucket & Storage Policies Setup
-- ==============================================================================

-- Create bucket 'nexora-files' if it does not exist
insert into storage.buckets (id, name, public)
values ('nexora-files', 'nexora-files', true)
on conflict (id) do update set public = true;

-- Storage Policy 1: Authenticated users can upload to nexora-files
drop policy if exists "Authenticated users can upload files" on storage.objects;
create policy "Authenticated users can upload files"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'nexora-files');

-- Storage Policy 2: Anyone can download public / shared files or authenticated users own files
drop policy if exists "Users can download files" on storage.objects;
create policy "Users can download files"
  on storage.objects for select
  using (bucket_id = 'nexora-files');

-- Storage Policy 3: Users can delete their own files in storage
drop policy if exists "Users can delete their files" on storage.objects;
create policy "Users can delete their files"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'nexora-files' and (storage.foldername(name))[1] = auth.uid()::text);
