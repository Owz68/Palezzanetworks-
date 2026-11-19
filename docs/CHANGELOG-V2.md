# Journal des changements V2 (branche v2-refonte)

## Étape 2 — corrections sans risque (19 nov. 2026)
- Libellés d'accessibilité en français (bouton thème, bouton menu) : `main.js`.
- `theme-color` alignés sur la palette existante (ivoire #F3EBDD, bleu nuit #0B1733) : `index.html`, `404.html`, `bibliotheque.html`.
- Bibliothèque : l'en-tête `Authorization: Bearer` n'est plus envoyé avec les clés « sb_… » (comme `site.js`) : `bibliotheque.js`.
- Admin : confirmation avant de retirer des éléments incomplets à l'enregistrement : `admin.js`.
- `wrangler.jsonc` : ajout de `not_found_handling: 404-page` (le nom du Worker n'est PAS modifié).
- Documentation : `docs/`.

Non modifiés : logos, icônes, couleurs (`palette.css`), base de données, secrets, nom du Worker.

## Étape 3 (début) — palette du cahier des charges, logo inchangé (19 nov. 2026)
- `palette.css` : palette #050B18, #0B1830, #1677FF, #36D9FF, #F5F8FF (+ nuances dérivées) ; les anciennes couleurs (#1E3C78, #247C78, #C76B50, #D6A64F, #A3B49A, #F3EBDD) ont disparu des pages publiques.
- Nouveau `v2-futur.css` (CSS seul, aucune bibliothèque) : fond sombre avec lueurs et grille fine, cartes en verre sombre, en-tête flouté, halos au survol, effets désactivés si le visiteur préfère moins d'animations.
- Thème sombre par défaut pour les nouveaux visiteurs ; le choix du visiteur reste mémorisé.
- **Logo** : fichiers `logo.png` / `logo-pn.png` non modifiés (empreintes identiques). En thème sombre, il garde ses couleurs d'origine sur une plaque blanche.
- Correction : sur écrans de 320 à 360 px (déjà présent dans la version d'origine), l'en-tête dépassait de l'écran ; la taille du logo s'adapte maintenant à la largeur.
- Non traité : `admin.html` et `admin-bibliotheque.html` gardent leurs couleurs actuelles (ils seront refaits dans le Control Center, étape 5).

Tests réalisés : 3 pages × thèmes clair et sombre × 6 largeurs (320, 360, 390, 414, 768, 1440 px) : aucun débordement, aucune erreur JavaScript.

## Étape 9 (début) — socle de données, en scripts à exécuter à la main (19 nov. 2026)
- Pas de projet Supabase de test (limite de 2 projets actifs du compte gratuit) : décision du propriétaire = validation manuelle. Rien n'a été exécuté sur la production.
- `supabase/SAUVEGARDE_AVANT_MIGRATION.sql`, `supabase/migrations/001_*` (équipe, permissions, versions, journal), `002_*` (compteur Bibliothèque), avec retours arrière.
- `docs/MIGRATIONS.md` : procédure pas à pas. `tests/sql/` : 37 vérifications sur une base Postgres locale, toutes réussies.
- Site public et admin : aucun changement dans ce lot.
