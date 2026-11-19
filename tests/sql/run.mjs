// Test des migrations 001/002 : node run.mjs   (nécessite : npm i @electric-sql/pglite)
import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
const R = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const db = new PGlite();
let ok = 0, ko = 0;
const check = (name, cond, extra = '') => { (cond ? ok++ : ko++); console.log((cond ? 'OK   ' : 'ECHEC') + ' ' + name + (cond ? '' : '  -> ' + extra)); };
const OWNER = { sub: '00000000-0000-0000-0000-0000000000aa', email: 'contactezowz@gmail.com' };
const ED = { sub: '00000000-0000-0000-0000-0000000000e1', email: 'editeur@test.local' };
const COM = { sub: '00000000-0000-0000-0000-0000000000c1', email: 'commercial@test.local' };
const NOBODY = { sub: '00000000-0000-0000-0000-0000000000f1', email: 'inconnu@test.local' };
async function as(who, sql, params) {
  const claims = who ? JSON.stringify({ sub: who.sub, email: who.email, role: 'authenticated' }) : '';
  await db.exec(`select set_config('request.jwt.claims', '${claims}', false); set role ${who ? 'authenticated' : 'anon'};`);
  try { return await db.query(sql, params); } finally { await db.exec('reset role;'); }
}
const fails = async (who, sql) => { try { await as(who, sql); return false; } catch (e) { return true; } };
const count = async (sql) => Number((await db.query(sql)).rows[0].n);

// ---- état « production actuelle » : scripts d'origine
await db.exec(R('mocks.sql'));
await db.exec(R('../../supabase/setup.sql'));
await db.exec(R('../../supabase/bibliotheque.sql'));
await db.exec("insert into auth.users(id,email) values ('" + OWNER.sub + "','" + OWNER.email + "'),('" + ED.sub + "','" + ED.email + "'),('" + COM.sub + "','" + COM.email + "'),('" + NOBODY.sub + "','" + NOBODY.email + "')");
await db.exec(`insert into public.site_settings(key,value) values ('site','{"whatsapp":"","projects":[{"title":"A"}]}')`);
const policiesBefore = (await db.query("select polname from pg_policy p join pg_class c on c.oid=p.polrelid where c.relname='site_settings' order by 1")).rows.map(r => r.polname);

// ---- sauvegarde puis migrations
await db.exec(R('../../supabase/SAUVEGARDE_AVANT_MIGRATION.sql'));
check('sauvegarde : copie identique (1 ligne)', await count('select count(*) n from public.backup_site_settings_20261119') === 1);
await db.exec(R('../../supabase/migrations/001_socle_equipe_versions_journal.sql'));
await db.exec(R('../../supabase/migrations/001_socle_equipe_versions_journal.sql')); // relançable sans danger
check('001 relançable sans erreur', true);
check('version 1 = état avant migration', await count("select count(*) n from public.content_versions where version=1 and note like 'État avant%'") === 1);
check('politiques d\'origine de site_settings conservées', policiesBefore.every(p => true) && (await db.query("select polname from pg_policy p join pg_class c on c.oid=p.polrelid where c.relname='site_settings' order by 1")).rows.map(r => r.polname).filter(n => policiesBefore.includes(n)).length === policiesBefore.length);

// ---- propriétaire historique
await as(OWNER, `update public.site_settings set value='{"whatsapp":"+242000","projects":[{"title":"A"}]}' where key='site'`);
check('propriétaire : enregistrement crée la version 2', await count("select count(*) n from public.content_versions where version=2") === 1);
await as(OWNER, `update public.site_settings set value='{"whatsapp":"+242000","projects":[{"title":"A"}]}', updated_at=now() where key='site'`);
check('valeur identique : pas de nouvelle version', await count("select count(*) n from public.content_versions") === 2);
check('journal : "content.save" écrit côté serveur', await count("select count(*) n from public.activity_logs where action='content.save' and actor_email='contactezowz@gmail.com'") === 1);
check('propriétaire peut lire le journal', (await as(OWNER, 'select count(*)::int n from public.activity_logs')).rows[0].n >= 1);

// ---- équipe
await as(OWNER, `insert into public.team_members(user_id,email,role) values ('${ED.sub}','${ED.email}','editeur'),('${COM.sub}','${COM.email}','resp_commercial')`);
check('propriétaire ajoute des membres + journal team.insert', await count("select count(*) n from public.activity_logs where action='team.insert'") === 2);
check('éditeur ne peut PAS ajouter un membre', await fails(ED, `insert into public.team_members(user_id,email,role) values ('${NOBODY.sub}','x@y.z','admin_principal')`));
check('éditeur ne peut PAS se donner un autre rôle', (await as(ED, `update public.team_members set role='admin_principal' where user_id='${ED.sub}' returning 1`)).rows.length === 0);
check('éditeur ne peut PAS lire le journal', (await as(ED, 'select count(*)::int n from public.activity_logs')).rows[0].n === 0);

await as(ED, `update public.site_settings set value='{"whatsapp":"+242000","projects":[{"title":"B"}]}' where key='site'`);
check('éditeur peut modifier le contenu (version 3, auteur = éditeur)', await count(`select count(*) n from public.content_versions where version=3 and author_email='${ED.email}'`) === 1);
check('éditeur peut lire les versions', (await as(ED, 'select count(*)::int n from public.content_versions')).rows[0].n === 3);
const v1 = (await db.query("select id from public.content_versions where version=1")).rows[0].id;
await as(ED, `select public.restore_content_version(${v1})`);
check('éditeur restaure la version 1 : contenu = état d\'origine', (await db.query("select value->>'whatsapp' w, value->'projects'->0->>'title' t from public.site_settings")).rows[0].w === '' );
check('la restauration crée la version 4 avec sa note', await count("select count(*) n from public.content_versions where version=4 and note='Restauration de la version 1'") === 1);

// ---- responsable commercial : pas de contenu
check('commercial ne peut PAS modifier le contenu', (await as(COM, `update public.site_settings set value='{"hack":true}' where key='site' returning 1`)).rows.length === 0);
check('commercial ne peut PAS créer de contenu', await fails(COM, `insert into public.site_settings(key,value) values ('x','{}')`));
check('commercial ne peut PAS restaurer', await fails(COM, `select public.restore_content_version(${v1})`));
check('commercial ne peut PAS lire les versions', (await as(COM, 'select count(*)::int n from public.content_versions')).rows[0].n === 0);

// ---- compte inconnu, anonyme
check('inconnu (connecté, hors équipe) ne peut PAS modifier', (await as(NOBODY, `update public.site_settings set value='{"hack":true}' where key='site' returning 1`)).rows.length === 0);
check('anonyme lit le site (lecture publique conservée)', (await as(null, 'select count(*)::int n from public.site_settings')).rows[0].n === 1);
check('anonyme ne peut PAS lire les versions', await fails(null, 'select 1 from public.content_versions'));
check('anonyme ne peut PAS lire l\'équipe', await fails(null, 'select 1 from public.team_members'));
check('anonyme ne peut PAS restaurer', await fails(null, `select public.restore_content_version(${v1})`));
check('anonyme ne peut PAS écrire dans le journal', await fails(null, `insert into public.activity_logs(action,entity) values ('x','y')`));
check('connecté ne peut PAS écrire dans le journal', await fails(NOBODY, `insert into public.activity_logs(action,entity) values ('x','y')`));
check('connecté ne peut PAS fabriquer une version', await fails(ED, `insert into public.content_versions(setting_key,value,version) values ('site','{}',99)`));
check('connecté ne peut PAS appeler log_activity', await fails(ED, `select public.log_activity('a','b','c','{}')`));

// ---- membre désactivé
await as(OWNER, `update public.team_members set active=false where user_id='${ED.sub}'`);
check('éditeur désactivé perd ses droits immédiatement', (await as(ED, `update public.site_settings set value='{"x":1}' where key='site' returning 1`)).rows.length === 0);

// ---- 002
await db.exec(R('../../supabase/migrations/002_durcissement_bibliotheque.sql'));
await as(null, `select public.bib_increment('police-valide-1')`); await as(null, `select public.bib_increment('police-valide-1')`);
await as(null, `select public.bib_increment('<script>alert(1)</script>')`); await as(null, `select public.bib_increment('MAJUSCULES ET espaces')`);
check('002 : slug valide compté 2 fois', await count("select downloads n from public.font_stats where slug='police-valide-1'") === 2);
check('002 : slugs invalides ignorés', await count("select count(*) n from public.font_stats") === 1);

// ---- retour arrière
const before = (await db.query("select value from public.site_settings")).rows[0].value;
await db.exec(R('../../supabase/migrations/002_rollback.sql'));
await as(null, `select public.bib_increment('ancien comportement')`);
check('002 retour arrière : ancien comportement rétabli', await count("select count(*) n from public.font_stats") === 2);
await db.exec(R('../../supabase/migrations/001_rollback.sql'));
check('001 retour arrière : tables supprimées', await count("select count(*) n from information_schema.tables where table_name in ('team_members','content_versions','activity_logs','role_permissions')") === 0);
check('001 retour arrière : données du site intactes', JSON.stringify((await db.query("select value from public.site_settings")).rows[0].value) === JSON.stringify(before));
check('001 retour arrière : politiques d\'origine intactes', (await db.query("select polname from pg_policy p join pg_class c on c.oid=p.polrelid where c.relname='site_settings' order by 1")).rows.map(r => r.polname).join() === policiesBefore.join());
check('001 retour arrière : le propriétaire peut toujours modifier', (await as(OWNER, `update public.site_settings set value='{"ok":1}' where key='site' returning 1`)).rows.length === 1);
console.log(`\n${ok} réussis, ${ko} échecs`);
process.exit(ko ? 1 : 0);
