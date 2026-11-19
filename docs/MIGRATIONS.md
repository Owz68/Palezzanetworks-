# Migrations Supabase — procédure à suivre à la main

Aucune migration n'a été exécutée sur ta base. Les scripts sont testés en local (37 vérifications, voir `tests/sql/`). Tu les exécutes toi-même, dans cet ordre, dans **Supabase > SQL Editor** du projet « Palezza networks site ».

## Avant de commencer
1. Exécuter `supabase/SAUVEGARDE_AVANT_MIGRATION.sql`. La dernière requête doit montrer le même nombre de lignes dans « origine » et « copie ».
2. Table Editor > `site_settings` > ligne `site` : copier la valeur JSON dans un fichier de ton téléphone.
3. Prévoir 10 minutes de calme : tant que tu n'as pas vérifié, ne modifie rien dans l'admin.

## Migration 001 — équipe, permissions, versions, journal
Fichier : `supabase/migrations/001_socle_equipe_versions_journal.sql`

**Ce qu'elle ajoute (rien n'est supprimé ni modifié)**
- Tables `team_members`, `role_permissions`, `content_versions`, `activity_logs`.
- Versions automatiques du contenu à chaque enregistrement (côté serveur, 500 dernières conservées), avec une version 1 = état avant migration.
- Fonction `restore_content_version` : restauration d'une version, réservée à ceux qui ont la permission.
- Journal des enregistrements et des changements d'équipe.
- Une politique supplémentaire sur `site_settings` pour les collaborateurs. **Ta politique actuelle (compte contactezowz@gmail.com) n'est pas touchée** : tu gardes tous les droits.

**Vérifier après exécution (3 requêtes)**
```
select count(*) from public.content_versions;                 -- ≥ 1 (la version 1)
select count(*) from public.role_permissions;                  -- 34
select polname from pg_policy where polrelid='public.site_settings'::regclass;  -- 3 lignes : lecture publique, ecriture gestionnaire, ecriture equipe
```
Puis ouvre le site public et l'admin : tout doit fonctionner comme avant.

**Ajouter un collaborateur (à faire par toi)**
1. Supabase > Authentication > Users > Add user (e-mail + mot de passe).
2. Dans le SQL Editor :
```
insert into public.team_members(user_id, email, role)
select id, email, 'editeur' from auth.users where email = 'adresse@du-collaborateur';
-- rôles : admin_principal, gestionnaire, editeur, resp_commercial, resp_assistance
```

**Retour arrière** : `001_rollback.sql` (supprime l'historique, le journal et l'équipe créés par 001 ; les données du site et tes politiques d'origine restent intactes).

## Migration 002 — compteur de téléchargements
Fichier : `supabase/migrations/002_durcissement_bibliotheque.sql`. Le compteur n'accepte plus que des noms de polices valides (minuscules, chiffres, tirets), ce qui bloque les lignes parasites. Retour arrière : `002_rollback.sql`.

## À regler dans le tableau de bord Supabase (pas en SQL)
- Authentication > Passwords : activer « Leaked password protection ».
- Authentication > Sign In / Providers : vérifier que les inscriptions publiques sont désactivées et que la confirmation d'e-mail est active.

## Volontairement NON traité
- La fonction `rls_auto_enable()` signalée par Supabase : elle ne vient pas de tes scripts ; à examiner avant d'y toucher.
- Les tables `services`, `projects`, `leads`, `quote_requests`, etc. du cahier des charges : elles seront proposées une par une, quand le module correspondant du Control Center existera. Le contenu actuel reste dans `site_settings`.

## Limites connues
- Rôles : les droits des collaborateurs sont contrôlés par la base ; l'admin actuel (`admin.html`) ne les affiche pas encore. Le Control Center s'y adaptera.
- Un administrateur principal peut modifier les rôles et les permissions ; le compte propriétaire reste prioritaire en cas d'erreur.
