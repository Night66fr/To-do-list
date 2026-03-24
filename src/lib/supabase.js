import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

/*
  SQL à coller dans Supabase > SQL Editor pour créer la table :

  create table tasks (
    id uuid primary key default gen_random_uuid(),
    text text not null,
    category text not null default 'perso',
    done boolean not null default false,
    day_date date null,
    created_at timestamptz default now()
  );

  -- Activer RLS (Row Level Security) - accès public en lecture/écriture pour commencer
  alter table tasks enable row level security;

  create policy "Public access" on tasks
    for all using (true) with check (true);
*/
