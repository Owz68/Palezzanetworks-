-- Migration 002 : compteur de téléchargements — n'accepte que des noms de polices valides.
-- Avant : n'importe quel texte pouvait créer des lignes dans font_stats. Après : les noms invalides sont ignorés.
-- Les noms existants (minuscules, chiffres, tirets) restent acceptés. Retour arrière : 002_rollback.sql.
create or replace function public.bib_increment(p_slug text) returns void
language sql security definer set search_path = public as $$
  insert into public.font_stats(slug, downloads)
  select p_slug, 1 where p_slug ~ '^[a-z0-9][a-z0-9-]{0,118}$'
  on conflict (slug) do update set downloads = public.font_stats.downloads + 1
$$;
grant execute on function public.bib_increment(text) to anon, authenticated;
