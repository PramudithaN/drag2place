-- Drag2Place: Supabase Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. BOARDS TABLE
create table if not exists public.boards (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'My Aesthetic Board',
  description text default '',
  pan_x float not null default 0,
  pan_y float not null default 0,
  zoom float not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CARDS TABLE
create table if not exists public.cards (
  id text primary key,
  board_id text references public.boards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('todo', 'note', 'event', 'image')),
  x float not null default 100,
  y float not null default 100,
  width float not null default 280,
  height float not null default 320,
  z_index integer not null default 1,
  color text not null default 'cream',
  content jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CONNECTIONS TABLE (Milanote-style connecting lines)
create table if not exists public.connections (
  id text primary key,
  board_id text references public.boards(id) on delete cascade not null,
  from_card_id text references public.cards(id) on delete cascade not null,
  to_card_id text references public.cards(id) on delete cascade not null,
  color text default '#8C827A',
  label text default '',
  style text default 'curved',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ROW LEVEL SECURITY (RLS)
alter table public.boards enable row level security;
alter table public.cards enable row level security;
alter table public.connections enable row level security;

-- Policies for boards
create policy "Users can view own boards" on public.boards
  for select using (auth.uid() = user_id);

create policy "Users can insert own boards" on public.boards
  for insert with check (auth.uid() = user_id);

create policy "Users can update own boards" on public.boards
  for update using (auth.uid() = user_id);

create policy "Users can delete own boards" on public.boards
  for delete using (auth.uid() = user_id);

-- Policies for cards
create policy "Users can view own cards" on public.cards
  for select using (auth.uid() = user_id);

create policy "Users can insert own cards" on public.cards
  for insert with check (auth.uid() = user_id);

create policy "Users can update own cards" on public.cards
  for update using (auth.uid() = user_id);

create policy "Users can delete own cards" on public.cards
  for delete using (auth.uid() = user_id);

-- Policies for connections
create policy "Users can manage own connections" on public.connections
  for all using (
    exists (
      select 1 from public.boards b
      where b.id = connections.board_id and b.user_id = auth.uid()
    )
  );

-- 5. REALTIME REPLICATION
alter publication supabase_realtime add table public.boards;
alter publication supabase_realtime add table public.cards;
alter publication supabase_realtime add table public.connections;
