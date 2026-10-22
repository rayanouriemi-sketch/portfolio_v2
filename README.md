# Portfolio — Rayan Ouriemi

Portfolio personnel d’étudiant ingénieur en informatique & électronique.
Site statique : HTML, CSS et un peu de JavaScript, sans framework ni étape de build.

## Structure

```
index.html              page d’accueil (hero, à propos, projets, compétences, parcours, contact)
projets/                une page d’étude de cas par projet
  campus-flow.html
  sentinelle-air.html
  hashline.html
  orbit-logic.html
assets/
  css/main.css          styles de la page d’accueil
  css/projet.css        styles des pages projets
  js/main.js            menu mobile, carte des compétences, démo des portes logiques, animations
  favicon.svg
```

## Voir le site en local

Ouvre simplement `index.html` dans un navigateur, ou lance un petit serveur :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Mise en ligne (GitHub Pages)

Settings → Pages → Source : **Deploy from a branch** → `main` / `(root)` → Save.
Le site est ensuite servi à `https://rayanouriemi-sketch.github.io/portfolio_v2/`.

## À personnaliser

- Projets, chiffres et parcours : contenus d’exemple, à remplacer par les vrais.
- Email : `mailto:contact@exemple.fr` dans `index.html`.
- LinkedIn : lien vers ton profil dans `index.html`.
- Couleur d’accent : variable `--acc` dans `assets/css/main.css` et `assets/css/projet.css`.
