-- Retour arrière de 002 : remet la fonction d'origine (supabase/bibliotheque.sql).
create or replace function public.bib_increment(p_slug text) returns void
language sql security definer set search_path = public as $$
  insert into public.font_stats(slug, downloads) values (left(p_slug, 120), 1)
  on conflict (slug) do update set downloads = public.font_stats.downloads + 1
$$;
grant execute on function public.bib_increment(text) to anon, authenticated;
