-- ============================================================================
-- PALEZZA NETWORK V2 — Migration 001 : équipe, permissions, versions, journal
-- À exécuter À LA MAIN dans Supabase > SQL Editor, APRÈS avoir fait la sauvegarde
-- (voir supabase/SAUVEGARDE_AVANT_MIGRATION.sql).
--
-- Principes :
--  * AJOUT SEULEMENT : aucune table, politique ou donnée existante n'est supprimée ni modifiée.
--  * Le compte actuel (contactezowz@gmail.com) garde tous ses droits : il reste "propriétaire".
--  * Les politiques existantes de site_settings ne sont pas touchées : on ajoute une politique
--    supplémentaire pour les collaborateurs (les politiques s'additionnent).
--  * Peut être relancé sans danger. Retour arrière : 001_rollback.sql.
-- ============================================================================

-- ---------- 1. Rôles et permissions ----------
create table if not exists public.team_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role text not null check (role in ('admin_principal','gestionnaire','editeur','resp_commercial','resp_assistance')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  role text not null check (role in ('admin_principal','gestionnaire','editeur','resp_commercial','resp_assistance')),
  permission text not null,
  primary key (role, permission)
);

-- Permissions initiales (modifiables ensuite par l'administrateur principal)
insert into public.role_permissions(role, permission) values
  ('admin_principal','content.write'),('admin_principal','media.write'),('admin_principal','versions.restore'),
  ('admin_principal','leads.read'),('admin_principal','leads.write'),('admin_principal','quotes.read'),('admin_principal','quotes.write'),
  ('admin_principal','tickets.read'),('admin_principal','tickets.write'),('admin_principal','stats.read'),
  ('admin_principal','logs.read'),('admin_principal','team.manage'),('admin_principal','settings.write'),
  ('gestionnaire','content.write'),('gestionnaire','media.write'),('gestionnaire','versions.restore'),
  ('gestionnaire','leads.read'),('gestionnaire','leads.write'),('gestionnaire','quotes.read'),('gestionnaire','quotes.write'),
  ('gestionnaire','tickets.read'),('gestionnaire','tickets.write'),('gestionnaire','stats.read'),('gestionnaire','logs.read'),
  ('editeur','content.write'),('editeur','media.write'),('editeur','versions.restore'),
  ('resp_commercial','leads.read'),('resp_commercial','leads.write'),('resp_commercial','quotes.read'),('resp_commercial','quotes.write'),('resp_commercial','stats.read'),
  ('resp_assistance','tickets.read'),('resp_assistance','tickets.write')
on conflict do nothing;

-- Propriétaire historique : garde tous les droits (aucun risque de se verrouiller dehors)
create or replace function public.is_legacy_owner() returns boolean
language sql stable set search_path = public as $$
  select coalesce(auth.jwt() ->> 'email','') = 'contactezowz@gmail.com'
$$;

-- Contrôle de permission, exécuté côté serveur (jamais décidé par le navigateur)
create or replace function public.has_permission(p text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_legacy_owner()
      or exists (
        select 1 from public.team_members m
        join public.role_permissions rp on rp.role = m.role
        where m.user_id = auth.uid() and m.active and rp.permission = p
      )
$$;
revoke all on function public.is_legacy_owner() from public;
revoke all on function public.has_permission(text) from public;
grant execute on function public.is_legacy_owner() to anon, authenticated;
grant execute on function public.has_permission(text) to anon, authenticated;

alter table public.team_members enable row level security;
alter table public.role_permissions enable row level security;
drop policy if exists "equipe : voir" on public.team_members;
create policy "equipe : voir" on public.team_members for select to authenticated
  using (user_id = auth.uid() or public.has_permission('team.manage'));
drop policy if exists "equipe : gerer" on public.team_members;
create policy "equipe : gerer" on public.team_members for all to authenticated
  using (public.has_permission('team.manage')) with check (public.has_permission('team.manage'));
drop policy if exists "roles : voir" on public.role_permissions;
create policy "roles : voir" on public.role_permissions for select to authenticated using (true);
drop policy if exists "roles : gerer" on public.role_permissions;
create policy "roles : gerer" on public.role_permissions for all to authenticated
  using (public.has_permission('team.manage')) with check (public.has_permission('team.manage'));

-- ---------- 2. Journal des opérations ----------
create table if not exists public.activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  actor_email text,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists activity_logs_created_idx on public.activity_logs (created_at desc);
alter table public.activity_logs enable row level security;
drop policy if exists "journal : lire" on public.activity_logs;
create policy "journal : lire" on public.activity_logs for select to authenticated
  using (public.has_permission('logs.read'));
-- Aucune politique d'écriture : seuls les déclencheurs ci-dessous écrivent dans le journal.

create or replace function public.log_activity(p_action text, p_entity text, p_entity_id text, p_details jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.activity_logs(actor_id, actor_email, action, entity, entity_id, details)
  values (auth.uid(), auth.jwt() ->> 'email', p_action, p_entity, p_entity_id, coalesce(p_details,'{}'::jsonb))
$$;
revoke all on function public.log_activity(text,text,text,jsonb) from public, anon, authenticated;

-- ---------- 3. Versions du contenu (historique et restauration) ----------
create table if not exists public.content_versions (
  id bigint generated always as identity primary key,
  setting_key text not null,
  value jsonb not null,
  version integer not null,
  author_id uuid,
  author_email text,
  note text,
  created_at timestamptz not null default now(),
  unique (setting_key, version)
);
create index if not exists content_versions_key_idx on public.content_versions (setting_key, version desc);
alter table public.content_versions enable row level security;
drop policy if exists "versions : lire" on public.content_versions;
create policy "versions : lire" on public.content_versions for select to authenticated
  using (public.has_permission('content.write'));
-- Aucune politique d'écriture : seules les fonctions ci-dessous créent des versions.

-- Photo de l'état actuel AVANT toute modification (version 1) : sécurité supplémentaire
insert into public.content_versions(setting_key, value, version, note)
select key, value, 1, 'État avant la migration V2' from public.site_settings
on conflict (setting_key, version) do nothing;

-- À chaque enregistrement du site : nouvelle version + entrée de journal (côté serveur,
-- donc impossible à contourner depuis le navigateur). Une valeur identique à la dernière
-- version n'en crée pas de nouvelle. On conserve les 500 dernières versions par clé.
create or replace function public.trg_site_settings_versions() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  last_value jsonb; last_version integer; new_version integer;
begin
  if tg_op = 'DELETE' then
    perform public.log_activity('content.delete','site_settings',old.key,'{}'::jsonb);
    return old;
  end if;
  select value, version into last_value, last_version
    from public.content_versions where setting_key = new.key order by version desc limit 1;
  if last_value is not null and last_value = new.value then
    return new;
  end if;
  new_version := coalesce(last_version, 0) + 1;
  insert into public.content_versions(setting_key, value, version, author_id, author_email, note)
  values (new.key, new.value, new_version, auth.uid(), auth.jwt() ->> 'email', nullif(current_setting('app.version_note', true), ''));
  perform public.log_activity('content.save','site_settings',new.key, jsonb_build_object('version', new_version));
  delete from public.content_versions where setting_key = new.key and version <= new_version - 500;
  return new;
end $$;
revoke all on function public.trg_site_settings_versions() from public, anon, authenticated;

drop trigger if exists site_settings_versions on public.site_settings;
create trigger site_settings_versions
  after insert or update or delete on public.site_settings
  for each row execute function public.trg_site_settings_versions();

-- Restauration d'une version (réservée aux personnes ayant la permission versions.restore)
create or replace function public.restore_content_version(p_id bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v public.content_versions;
begin
  if not public.has_permission('versions.restore') then
    raise exception 'Permission refusée' using errcode = '42501';
  end if;
  select * into v from public.content_versions where id = p_id;
  if not found then raise exception 'Version introuvable' using errcode = 'P0002'; end if;
  perform set_config('app.version_note', 'Restauration de la version ' || v.version, true);
  insert into public.site_settings(key, value, updated_at) values (v.setting_key, v.value, now())
  on conflict (key) do update set value = excluded.value, updated_at = now();
  perform public.log_activity('content.restore','site_settings',v.setting_key, jsonb_build_object('from_version', v.version));
  return jsonb_build_object('key', v.setting_key, 'restored_version', v.version);
end $$;
revoke all on function public.restore_content_version(bigint) from public, anon;
grant execute on function public.restore_content_version(bigint) to authenticated;

-- ---------- 4. Journal des changements d'équipe ----------
create or replace function public.trg_team_log() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    perform public.log_activity('team.delete','team_members',old.email, jsonb_build_object('role', old.role));
    return old;
  end if;
  perform public.log_activity('team.' || lower(tg_op),'team_members',new.email, jsonb_build_object('role', new.role, 'active', new.active));
  return new;
end $$;
revoke all on function public.trg_team_log() from public, anon, authenticated;
drop trigger if exists team_log on public.team_members;
create trigger team_log after insert or update or delete on public.team_members
  for each row execute function public.trg_team_log();

-- ---------- 5. Droits d'écriture des collaborateurs sur le contenu ----------
-- Politique AJOUTÉE (la politique "ecriture gestionnaire" existante reste en place, inchangée).
drop policy if exists "ecriture equipe" on public.site_settings;
create policy "ecriture equipe" on public.site_settings for all to authenticated
  using (public.has_permission('content.write')) with check (public.has_permission('content.write'));

-- Images du site : les collaborateurs avec media.write peuvent gérer les fichiers (politique ajoutée).
drop policy if exists "equipe images" on storage.objects;
create policy "equipe images" on storage.objects for all to authenticated
  using (bucket_id = 'site-images' and public.has_permission('media.write'))
  with check (bucket_id = 'site-images' and public.has_permission('media.write'));

-- Pas d'accès anonyme aux nouvelles tables
revoke all on public.team_members, public.role_permissions, public.activity_logs, public.content_versions from anon;
