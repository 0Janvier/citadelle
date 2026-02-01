# Citadelle

> Éditeur de texte et markdown ultraléger et moderne - Une version moderne de TextEdit avec support WYSIWYG style Notion/Typora.

## ✨ Fonctionnalités

### 🎯 Actuellement implémentées

- ✅ **Éditeur WYSIWYG** avec TipTap
  - Tapez `# Titre` → devient instantanément un titre H1
  - `**gras**` → texte en gras
  - `[lien](url)` → lien cliquable
  - Support complet Markdown (listes, tables, code blocks, task lists)

- ✅ **Système de tabs** - Gérez plusieurs fichiers simultanément
- ✅ **Auto-save intelligent** - Sauvegarde automatique toutes les 3 secondes
- ✅ **Thèmes** - Light, Dark, Sepia avec détection système
- ✅ **Statistiques en temps réel** - Mots, caractères, lignes, temps de lecture
- ✅ **Raccourcis clavier** - Navigation rapide et efficace
- ✅ **Mode distraction-free** - Interface minimale pour écriture focalisée

### 🚧 En développement

- Command Palette (Cmd+P)
- Recherche et remplacement avancé
- Export HTML/PDF
- Mode preview Markdown

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm
- Rust (pour Tauri)
- macOS / Windows / Linux

### Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run tauri:dev

# Build pour production
npm run tauri:build
```

## ⌨️ Raccourcis clavier

### Fichiers
- `Cmd+N` - Nouveau document
- `Cmd+O` - Ouvrir fichier
- `Cmd+S` - Sauvegarder
- `Cmd+Shift+S` - Sauvegarder sous
- `Cmd+W` - Fermer tab actif

### Édition
- `Cmd+B` - **Gras**
- `Cmd+I` - *Italique*
- `Cmd+K` - Insérer lien
- `Cmd+Z` / `Cmd+Shift+Z` - Annuler/Refaire

### Navigation
- `Cmd+Tab` / `Cmd+Shift+Tab` - Naviguer entre tabs
- `Cmd+1...9` - Aller au tab N
- `Cmd+F` - Rechercher

### Vue
- `Cmd+T` - Changer le thème
- `Cmd+Shift+D` - Mode distraction-free
- `Cmd+=` / `Cmd+-` - Zoom in/out
- `Cmd+0` - Reset zoom

## 🏗️ Architecture

```
citadelle/
├── src-tauri/              # Backend Rust (Tauri)
│   ├── src/
│   │   └── main.rs         # Commandes IPC (read_file, write_file)
│   └── tauri.conf.json     # Configuration Tauri
│
├── src/                    # Frontend React + TypeScript
│   ├── components/         # Composants UI
│   │   ├── Editor.tsx      # Wrapper TipTap WYSIWYG
│   │   ├── TabBar.tsx      # Système de tabs
│   │   ├── Toolbar.tsx     # Barre d'outils
│   │   └── StatusBar.tsx   # Statistiques
│   │
│   ├── editor/
│   │   └── extensions.ts   # Configuration TipTap
│   │
│   ├── store/              # State management (Zustand)
│   │   ├── useDocumentStore.ts
│   │   ├── useEditorStore.ts
│   │   └── useSettingsStore.ts
│   │
│   ├── hooks/
│   │   ├── useAutoSave.ts
│   │   ├── useFileOperations.ts
│   │   └── useKeyboardShortcuts.ts
│   │
│   └── styles/             # CSS (Tailwind)
│
└── package.json
```

## 📦 Technologies

- **Framework**: [Tauri](https://tauri.app/) (~5 MB vs ~100 MB pour Electron)
- **Frontend**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Éditeur**: [TipTap](https://tiptap.dev/) (WYSIWYG basé sur ProseMirror)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Style**: [Tailwind CSS](https://tailwindcss.com/)
- **Build**: [Vite](https://vitejs.dev/)

## 🎯 Objectifs de performance

- ✅ Taille app: **< 5 MB** (macOS)
- ✅ Bundle frontend: **< 250 KB** gzipped
- ✅ Démarrage: **< 1 seconde**
- ✅ Mémoire idle: **< 100 MB**
- ✅ Support fichiers jusqu'à **10 MB** fluide

## 🛣️ Roadmap

### Phase 1 - MVP ✅ (En cours)
- [x] Setup infrastructure
- [x] Éditeur WYSIWYG TipTap
- [x] Système de tabs
- [x] Auto-save
- [x] Thèmes
- [ ] Command Palette
- [ ] Tests E2E

### Phase 2 - Améliorations
- [ ] Recherche/Remplacement avancé
- [ ] Export HTML/PDF
- [ ] Préférences UI
- [ ] Distraction-free mode complet
- [ ] Performance optimization

### Phase 3 - Polish
- [ ] File associations (.md, .txt)
- [ ] Recent files list
- [ ] Crash recovery
- [ ] Icons macOS
- [ ] Distribution

## 📝 License

MIT

## 👤 Auteur

Créé avec ❤️ par Marc
