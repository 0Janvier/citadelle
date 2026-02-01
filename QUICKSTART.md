# 🚀 Guide de démarrage rapide - Citadelle

## Installation et lancement

### 1. Installer les dépendances (si ce n'est pas déjà fait)

```bash
npm install
```

### 2. Lancer en mode développement

```bash
npm run tauri:dev
```

Cela va:
- Démarrer le serveur Vite (frontend)
- Compiler et lancer l'application Tauri (backend Rust)
- Ouvrir une fenêtre avec l'application

**⏱️ Premier lancement**: Environ 1-2 minutes (compilation Rust)
**Lancements suivants**: ~10-15 secondes

## ✨ Premières actions à essayer

### 1. Créer votre premier document

L'application s'ouvre avec un document vide. Essayez de taper:

```markdown
# Mon premier document

Ceci est **gras** et ceci est *italique*.

- Liste item 1
- Liste item 2

## Code
\`\`\`javascript
console.log("Hello Citadelle!")
\`\`\`
```

Vous verrez le texte se formater en temps réel (WYSIWYG)!

### 2. Tester les raccourcis clavier

- `Cmd+N` - Créer un nouveau tab
- `Cmd+O` - Ouvrir un fichier Markdown
- `Cmd+S` - Sauvegarder
- `Cmd+P` - **Ouvrir la Command Palette** (essayez!)
- `Cmd+T` - Changer le thème (Light → Dark → Sepia)
- `Cmd+Shift+D` - Mode sans distraction

### 3. Explorer la Command Palette

1. Appuyez sur `Cmd+P`
2. Tapez "theme" pour voir toutes les commandes de thème
3. Sélectionnez une commande avec ↑↓ et Enter

### 4. Tester l'auto-save

1. Ouvrez un fichier Markdown existant (`Cmd+O`)
2. Modifiez le contenu
3. Observez le • dans le tab (= non sauvegardé)
4. Attendez 3 secondes → le • disparaît (sauvegardé!)

### 5. Multi-tabs

- `Cmd+N` plusieurs fois pour créer plusieurs documents
- `Cmd+Tab` pour naviguer entre les tabs
- `Cmd+1`, `Cmd+2`, etc. pour aller directement au tab N
- Cliquez sur `×` pour fermer un tab

## 🎨 Personnalisation

### Changer le thème

- `Cmd+T` pour cycler entre Light → Dark → Sepia
- Ou `Cmd+P` puis tapez "theme" pour choisir directement

### Zoom

- `Cmd++` pour agrandir
- `Cmd+-` pour réduire
- `Cmd+0` pour réinitialiser

## 🐛 En cas de problème

### L'application ne démarre pas

```bash
# Vérifiez que Rust est installé
rustc --version

# Réinstallez les dépendances
rm -rf node_modules
npm install

# Nettoyez le cache Tauri
rm -rf src-tauri/target
```

### Erreurs de compilation TypeScript

```bash
# Vérifiez les types
npx tsc --noEmit

# Relancez le dev server
npm run tauri:dev
```

### Le port 1420 est déjà utilisé

```bash
# Tuez le processus
lsof -ti:1420 | xargs kill -9

# Relancez
npm run tauri:dev
```

## 📊 État actuel du projet

### ✅ Fonctionnalités implémentées (18/20 - 90%)

- ✅ Éditeur WYSIWYG (TipTap)
- ✅ Système de tabs
- ✅ Auto-save (3 secondes)
- ✅ Thèmes (Light, Dark, Sepia, Auto)
- ✅ Command Palette (Cmd+P)
- ✅ Raccourcis clavier complets
- ✅ Toolbar auto-hide
- ✅ StatusBar avec statistiques
- ✅ Mode distraction-free
- ✅ Import/Export Markdown
- ✅ Zoom
- ✅ File operations (Open, Save, Save As)

### 🚧 Reste à faire

- [ ] Tests end-to-end (#19)
- [ ] Build production + icons macOS (#20)

### 🎯 Prochaines étapes suggérées

1. **Tester l'application**: Lancez `npm run tauri:dev` et explorez!
2. **Créer quelques documents**: Testez le WYSIWYG avec du vrai contenu
3. **Vérifier les performances**: Ouvrez un gros fichier Markdown
4. **Tester sur différents thèmes**: Light, Dark, Sepia
5. **Essayer tous les raccourcis**: Voir README.md

## 🏗️ Pour aller plus loin

### Build pour production

```bash
npm run tauri:build
```

Cela créera une application native dans `src-tauri/target/release/bundle/`

### Modifier le code

- **Frontend React**: `src/` (hot reload automatique)
- **Backend Rust**: `src-tauri/src/` (recompilation automatique)
- **Styles**: `src/styles/` (Tailwind CSS)

### Structure des stores (Zustand)

- `useDocumentStore`: Gestion documents/tabs
- `useEditorStore`: État UI (zoom, distraction-free, etc.)
- `useSettingsStore`: Préférences (thème, auto-save, etc.)

---

**🎉 Amusez-vous bien avec Citadelle!**

Si vous avez des questions ou rencontrez des problèmes, consultez le README.md ou le code source.
