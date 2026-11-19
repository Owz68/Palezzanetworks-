# Environnement de travail — Palezza Network V2

## Principe
- La production (Worker Cloudflare, base Supabase, dépôt GitHub `main`) n'est **jamais** modifiée pendant la refonte.
- Tout le travail se fait sur la branche `v2-refonte`. La version d'origine est figée par le tag `baseline-v6-prod`.

## Version d'origine (preuve d'intégrité)
- Archive : `Palezzanetworks--main.zip`
- SHA-256 : `a5798d8196979dca99aa6e0466b1e35de6bd01fc88efe1417f134cb86358b921`
- Logos et icônes : empreintes dans `docs/empreintes-logos.sha256` (doivent rester identiques).

## Mettre la branche sur GitHub (à faire par le propriétaire)
```
git clone <URL-du-depot> && cd <dossier>
git tag baseline-v6-prod            # sur la version actuelle de main
git push origin baseline-v6-prod
git checkout -b v2-refonte
# copier les fichiers du dossier de travail, puis :
git add -A && git commit -m "V2 : corrections étape 2"
git push -u origin v2-refonte
```
Ne pas fusionner dans `main` sans validation.

## Test local (aucun accès à la production)
```
cd public && python3 -m http.server 8000
# ouvrir http://localhost:8000
```
Sans réseau Supabase, le site affiche ses textes par défaut. L'admin demande Supabase : utiliser un projet de TEST (voir ci-dessous).

## Environnement de test à créer (non encore fait — nécessite le propriétaire)
1. **Projet Supabase de test**, séparé de la production : exécuter `supabase/setup.sql` puis `supabase/bibliotheque.sql`, créer un compte gestionnaire de test, mettre l'URL et la clé de TEST dans `public/assets/js/config.js` (branche de refonte uniquement).
2. **Worker Cloudflare de test**, avec un nom différent de la production (ex. `palezzanetworks-v2-test`) : `npx wrangler deploy --name palezzanetworks-v2-test`. Ne jamais déployer sous le nom du Worker actif.
3. Ne jamais lancer de test destructif sur la base de production.

## Configurations à connaître
- `wrangler.jsonc` : nom `palezzanetworksv2` (à comparer avec le nom réel du Worker en ligne avant tout déploiement), assets `./public`, `not_found_handling: 404-page` (ajouté, à tester sur le Worker de test).
- Aucun secret dans le dépôt. La clé Supabase de `config.js` est la clé publique « publishable ».
