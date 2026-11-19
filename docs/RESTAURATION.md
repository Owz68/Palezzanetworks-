# Procédure de restauration

## Retour à la version d'origine
- **Fichiers** : `git checkout baseline-v6-prod` (ou ré-extraire `Palezzanetworks--main.zip`, SHA-256 dans ENVIRONNEMENT.md).
- **Production Cloudflare** : elle n'a pas été touchée. En cas de besoin, utiliser l'historique des déploiements du Worker (tableau de bord Cloudflare > Workers > Deployments) pour revenir à la version précédente.
- **Données Supabase** : aucune migration n'a été exécutée. Avant toute migration future : sauvegarde (export de `site_settings` et des tables concernées) et script de retour arrière écrits et validés.

## Sauvegarde manuelle du contenu actuel (à faire avant la première migration)
Supabase > Table Editor > `site_settings` > ligne `key = site` : copier la valeur JSON dans un fichier daté. Faire de même pour `fonts` et `font_stats`.
