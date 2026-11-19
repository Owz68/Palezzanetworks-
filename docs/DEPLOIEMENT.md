# Déploiement de la version V2 (étape 2) — sans toucher la production

## Contenu de ce zip
Site complet (`public/`), scripts SQL (`supabase/`, inchangés), `wrangler.jsonc`, documentation (`docs/`) et le patch exact des changements (`docs/etape2-changements.patch`).

## 1. GitHub — branche de test, pas `main`
Dépôt actuel : celui du site (branche `main` = production).
1. Sur GitHub : bouton de branche > créer la branche `v2-refonte` à partir de `main`.
2. Sur cette branche : Add file > Upload files, déposer le contenu du dossier `palezzanetworks` (pas le dossier lui-même), puis Commit.
3. Ouvrir une Pull Request `v2-refonte` vers `main` pour relire les changements. **Ne pas fusionner** avant validation.
En ligne de commande : voir `docs/ENVIRONNEMENT.md`.

## 2. Cloudflare
Ne rien changer au Worker `palezzanetworks-v2`. Pour tester : créer un Worker séparé (ex. `palezzanetworks-v2-test`) ou utiliser les aperçus de branche si l'option est activée. Ne pas renommer `wrangler.jsonc` vers le nom de production.

## 3. Supabase
Rien à exécuter pour cette version. Les futures migrations (versions, rôles, journal, leads) seront livrées en scripts séparés avec sauvegarde et retour arrière, et ne seront appliquées qu'après ton accord, de préférence sur un projet de test.

## 4. Retour arrière
Voir `docs/RESTAURATION.md`.
