# Portfolio — Rayan Ouriemi

Portfolio personnel d’étudiant ingénieur en informatique & électronique.
Site statique : HTML, CSS et un peu de JavaScript, sans framework ni étape de build.

## Structure

```
index.html              accueil (hero, chapitre actuel, projets phares, aperçu du parcours)
projets.html            les 20 projets, filtrables par catégorie
a-propos.html           bio, stack (carte mère interactive), approche
parcours.html           chronologie, boîte à outils, principes
contact.html            email, liens, FAQ
assets/
  css/main.css          styles (communs à toutes les pages)
  js/main.js            menu mobile, fiche technique, copie de l’email, filtre des projets
  projects/             captures des projets
  favicon.svg
```

La nav, le bandeau d’appel à l’action et le pied de page sont dupliqués dans chaque page :
une modification doit être reportée sur les cinq fichiers.

Le contenu (parcours, projets, textes) reprend celui de [rayanouriemi.fr](https://rayanouriemi.fr).
Le CV est servi depuis `https://rayanouriemi.fr/cv-rayan-ouriemi.pdf`.

## Voir le site en local

Ouvre simplement `index.html` dans un navigateur, ou lance un petit serveur :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Mise en ligne (Vercel)

Importer le dépôt sur [vercel.com/new](https://vercel.com/new), preset **Other**, sans commande de build ni dossier de sortie.
Ou en ligne de commande : `npx vercel` puis `npx vercel --prod`.

L’hébergeur est cité dans `cgu.html` et `confidentialite.html` : à mettre à jour en cas de changement.

## À personnaliser

- Couleur d’accent : variable `--acc` dans `assets/css/main.css`.
- Niveaux de la stack : objet `SKILLS` dans `assets/js/main.js`.
