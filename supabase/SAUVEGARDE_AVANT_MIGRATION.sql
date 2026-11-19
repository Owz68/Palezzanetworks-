-- À exécuter AVANT toute migration (Supabase > SQL Editor). Ne modifie aucune donnée existante.
-- 1) Copie de sécurité dans la base (tables séparées, datées)
create table if not exists public.backup_site_settings_20261119 as select * from public.site_settings;
create table if not exists public.backup_fonts_20261119 as select * from public.fonts;
create table if not exists public.backup_font_stats_20261119 as select * from public.font_stats;
alter table public.backup_site_settings_20261119 enable row level security;
alter table public.backup_fonts_20261119 enable row level security;
alter table public.backup_font_stats_20261119 enable row level security;
-- (RLS activée sans politique : ces copies ne sont lisibles que depuis le SQL Editor.)

-- 2) Vérification : doit afficher le même nombre de lignes que les tables d'origine
select 'site_settings' as table_, (select count(*) from public.site_settings) as origine, (select count(*) from public.backup_site_settings_20261119) as copie
union all select 'fonts', (select count(*) from public.fonts), (select count(*) from public.backup_fonts_20261119)
union all select 'font_stats', (select count(*) from public.font_stats), (select count(*) from public.backup_font_stats_20261119);

-- 3) En plus : Table Editor > site_settings > ligne "site" : copier la valeur JSON dans un fichier sur ton téléphone/ordinateur.
-- Restauration éventuelle (seulement si nécessaire) :
--   insert into public.site_settings select * from public.backup_site_settings_20261119 on conflict (key) do update set value = excluded.value;
