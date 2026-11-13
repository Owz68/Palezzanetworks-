-- BIBLIOTHÈQUE (Polices) — à relire puis exécuter À LA MAIN dans Supabase > SQL Editor.
-- Ne touche à aucune table existante (site_settings). Peut être relancé sans danger.
create table if not exists public.fonts (
  id bigint generated always as identity primary key,
  slug text unique not null,
  name text not null,
  author text,
  category text not null check (category in ('Modernes','Élégantes','Manuscrites','Calligraphiques','Graffiti','Futuristes','Serif','Sans-serif','Décoratives','Publicitaires','Africaines')),
  description text,
  formats text[] not null default '{}',
  license text not null,
  redistribution boolean not null default false,
  usage text,
  files jsonb not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  check (not published or redistribution)
);
alter table public.fonts enable row level security;
drop policy if exists "polices publiees lisibles" on public.fonts;
create policy "polices publiees lisibles" on public.fonts for select using (published = true or (auth.jwt() ->> 'email') = 'contactezowz@gmail.com');
drop policy if exists "polices gestionnaire" on public.fonts;
create policy "polices gestionnaire" on public.fonts for all
  using ((auth.jwt() ->> 'email') = 'contactezowz@gmail.com') with check ((auth.jwt() ->> 'email') = 'contactezowz@gmail.com');

create table if not exists public.font_stats (slug text primary key, downloads integer not null default 0);
alter table public.font_stats enable row level security;
drop policy if exists "stats lisibles" on public.font_stats;
create policy "stats lisibles" on public.font_stats for select using (true);
-- Pas de politique d'écriture : seul le compteur ci-dessous peut modifier la table.
create or replace function public.bib_increment(p_slug text) returns void
language sql security definer set search_path = public as $$
  insert into public.font_stats(slug, downloads) values (left(p_slug, 120), 1)
  on conflict (slug) do update set downloads = public.font_stats.downloads + 1
$$;
grant execute on function public.bib_increment(text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bibliotheque-fonts', 'bibliotheque-fonts', true, 5242880,
  array['font/ttf','font/otf','font/woff','font/woff2','application/font-woff','application/font-woff2','application/x-font-ttf','application/x-font-otf','application/vnd.ms-opentype','application/octet-stream'])
on conflict (id) do nothing;
drop policy if exists "bibliotheque gestionnaire" on storage.objects;
create policy "bibliotheque gestionnaire" on storage.objects for all
  using (bucket_id = 'bibliotheque-fonts' and (auth.jwt() ->> 'email') = 'contactezowz@gmail.com')
  with check (bucket_id = 'bibliotheque-fonts' and (auth.jwt() ->> 'email') = 'contactezowz@gmail.com');
