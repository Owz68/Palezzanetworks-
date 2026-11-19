# État vérifié le 19 nov. 2026 (lecture seule, rien modifié)

## Cloudflare
- Le Worker de production s'appelle **`palezzanetworks-v2`** (avec tiret). Dernière modification : 13 nov. 2026, 10:38 (même heure que les fichiers du ZIP).
- `wrangler.jsonc` contient `palezzanetworksv2` (sans tiret) : **ce nom ne correspond à aucun Worker existant**. Un `wrangler deploy` créerait un nouveau Worker, il n'écraserait pas la production.
- **Ne pas modifier ce nom sans décision explicite.** Un ancien Worker `palezzanetworks` existe aussi (28 oct. 2026), à garder ou archiver plus tard.
- Autres Workers du compte (non concernés) : youcard, voicelab, palezza-studios, palezza-reader, palezza-documents, podcast-note, care, sery-hair-st-phane.

## Supabase
- Projet du site : « Palezza networks site » (ref `aafxgblvydiivuxeglll`), actif. C'est **la production** (même URL que `config.js`). Aucun projet de test n'existe.
- Tables : `site_settings` (RLS activée, 0 ligne selon l'estimation, à confirmer dans le Table Editor), `fonts` (RLS, 0), `font_stats` (RLS, 2). Donc `bibliotheque.sql` a bien été exécuté.
- Alertes de sécurité (niveau WARN) :
  1. `bib_increment` est exécutable par tout le monde (voulu pour le compteur, mais sans contrôle du nom envoyé).
  2. `rls_auto_enable()` (fonction qui ne vient pas des scripts de ce dépôt) est exécutable par `anon` et `authenticated` : à examiner avant de révoquer.
  3. Protection contre les mots de passe compromis désactivée : à activer dans Supabase > Authentication.
- Non vérifié : inscriptions publiques et confirmation d'e-mail (réglage Auth, non lisible ici).

## Ce qui n'a PAS été déployé
Aucune migration SQL, aucun déploiement, aucun changement sur GitHub, Cloudflare ou Supabase. Cette version ne contient aucun changement de base de données.
