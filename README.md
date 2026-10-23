# Folder Stats

Hover a folder in the file explorer and a small tooltip appears just above and to the right of the mouse, and follows
it, with what is inside the folder:

```
Total folders: 14 · Total files: 130
Folders until file: 3
```

The first line counts everything under the folder, all subfolders included. Files are every non-folder file (notes,
images, PDFs). The second line is how many folders deep you have to go to reach the folder's furthest file: 0 when the
file sits directly in the folder, "no files" when there are none. The tooltip goes away when the mouse leaves the row,
or when you click or start a drag. It never catches the mouse.

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
