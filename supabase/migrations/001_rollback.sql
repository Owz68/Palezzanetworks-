-- Retour arrière de la migration 001. Ne touche NI à site_settings (données), NI aux politiques d'origine.
-- ATTENTION : supprime l'historique des versions, le journal et la liste de l'équipe créés par 001.
drop policy if exists "equipe images" on storage.objects;
drop policy if exists "ecriture equipe" on public.site_settings;
drop trigger if exists site_settings_versions on public.site_settings;
drop trigger if exists team_log on public.team_members;
drop function if exists public.restore_content_version(bigint);
drop function if exists public.trg_site_settings_versions();
drop function if exists public.trg_team_log();
drop function if exists public.log_activity(text,text,text,jsonb);
drop table if exists public.content_versions;
drop table if exists public.activity_logs;
drop table if exists public.team_members;
drop table if exists public.role_permissions;
drop function if exists public.has_permission(text);
drop function if exists public.is_legacy_owner();
