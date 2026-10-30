-- À coller dans Supabase > SQL Editor > Run (une seule fois)
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);
alter table public.site_settings enable row level security;

drop policy if exists "lecture publique" on public.site_settings;
create policy "lecture publique" on public.site_settings
  for select using (true);

-- Seul ce compte peut modifier le site (changez l'e-mail si besoin)
drop policy if exists "ecriture gestionnaire" on public.site_settings;
create policy "ecriture gestionnaire" on public.site_settings
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'contactezowz@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'contactezowz@gmail.com');

-- Images du site (déjà appliqué sur le projet Supabase)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "gestionnaire images" on storage.objects;
create policy "gestionnaire images" on storage.objects
  for all to authenticated
  using (bucket_id = 'site-images' and (auth.jwt() ->> 'email') = 'contactezowz@gmail.com')
  with check (bucket_id = 'site-images' and (auth.jwt() ->> 'email') = 'contactezowz@gmail.com');
