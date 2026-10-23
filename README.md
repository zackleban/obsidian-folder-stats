# Folder Stats

Hover a folder in the file explorer and a small tooltip follows the mouse with what is inside it:

```
6 folders · 22 files
all levels: 14 folders · 130 files, 97 notes
```

The first line is the folder's direct children. The second counts everything under it, all subfolders included. Files
are every non-folder file (notes, images, PDFs); notes are the `.md` ones. The tooltip goes away when the mouse leaves
the row, or when you click or start a drag. It never catches the mouse.

Counts come from the vault (`app.vault`), computed on hover and cached until a file or folder is created, deleted or
renamed.

## Colours

Set in `styles.css` (same purple as File Placer); a CSS snippet can override them:

```
body {
	--folder-stats-bg: rgba(139, 92, 246, 0.16);
	--folder-stats-border: #4c1d95;
}
```

## Install by hand

Copy `main.js`, `manifest.json` and `styles.css` into `<your vault>/.obsidian/plugins/folder-stats/`, then turn it on
under Settings, Community plugins.

## Build

```
npm install
npm run build
```

`npm run dev` rebuilds on every save.
