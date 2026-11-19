# Tests SQL des migrations (en local, sans toucher à Supabase)
```
cd tests/sql && npm i @electric-sql/pglite && node run.mjs
```
Le script recrée une base Postgres locale, y joue tes scripts d'origine (`setup.sql`, `bibliotheque.sql`), la sauvegarde, puis les migrations 001 et 002 : droits par rôle, versions, journal, restauration, retour arrière.
Limite : c'est une simulation de Supabase (schémas `auth` et `storage` simulés). Elle ne remplace pas une vérification sur un vrai projet.
