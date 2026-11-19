# Déploiement de la version V2 (étape 2) — sans toucher la production

## Contenu de ce zip
Site complet (`public/`), scripts SQL d'origine (`supabase/setup.sql`, `bibliotheque.sql`, inchangés) et nouvelles migrations à exécuter à la main (`supabase/migrations/`, procédure dans `docs/MIGRATIONS.md`), tests (`tests/`), `wrangler.jsonc` et documentation (`docs/`).

## 1. GitHub — branche de test, pas `main`
Dépôt actuel : celui du site (branche `main` = production).
1. Sur GitHub : bouton de branche > créer la branche `v2-refonte` à partir de `main`.
2. Sur cette branche : Add file > Upload files, déposer le contenu du dossier `palezzanetworks` (pas le dossier lui-même), puis Commit.
3. Ouvrir une Pull Request `v2-refonte` vers `main` pour relire les changements. **Ne pas fusionner** avant validation.
En ligne de commande : voir `docs/ENVIRONNEMENT.md`.

## 2. Cloudflare
Ne rien changer au Worker `palezzanetworks-v2`. Pour tester : créer un Worker séparé (ex. `palezzanetworks-v2-test`) ou utiliser les aperçus de branche si l'option est activée. Ne pas renommer `wrangler.jsonc` vers le nom de production.

## 3. Supabase
Rien n'a été exécuté. Les migrations (versions, rôles, journal) sont prêtes : suivre `docs/MIGRATIONS.md` (sauvegarde d'abord, retour arrière fourni). Elles ne s'exécutent jamais toutes seules.

## 4. Retour arrière
Voir `docs/RESTAURATION.md`.
