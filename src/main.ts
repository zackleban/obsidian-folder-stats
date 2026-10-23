import { Plugin, TAbstractFile, TFile, TFolder } from "obsidian";

const FOLDER_ROW = ".nav-files-container .nav-folder-title";
const TIP_CLASS = "folder-stats-tip";
// The tooltip sits this far right of and below the mouse, so it never covers the row under it.
const OFFSET_X = 16;
const OFFSET_Y = 12;

interface Counts {
	folders: number;
	files: number;
	notes: number;
}

const isNote = (file: TAbstractFile): file is TFile => file instanceof TFile && file.extension === "md";
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const line = (c: Counts) => `${plural(c.folders, "folder", "folders")} · ${plural(c.files, "file", "files")}`;

export default class FolderStatsPlugin extends Plugin {
	private tip: HTMLElement | null = null;
	private row: HTMLElement | null = null;
	// Totals per folder path, thrown away whenever something is created, deleted or renamed.
	private cache = new Map<string, Counts>();

	onload() {
		const clear = () => this.cache.clear();
		this.registerEvent(this.app.vault.on("create", clear));
		this.registerEvent(this.app.vault.on("delete", clear));
		this.registerEvent(this.app.vault.on("rename", clear));

		this.registerDomEvent(document, "mousemove", (e: MouseEvent) => this.move(e));
		// A drag is File Placer's job; the tooltip steps aside, and so does a click.
		this.registerDomEvent(document, "mousedown", () => this.hide());
		this.registerDomEvent(document, "dragstart", () => this.hide());
		this.registerDomEvent(document, "mouseleave", () => this.hide());
		this.registerDomEvent(window, "blur", () => this.hide());
	}

	onunload() {
		this.hide();
	}

	private move(e: MouseEvent) {
		const target = e.target instanceof Element ? e.target : null;
		const row = target?.closest<HTMLElement>(FOLDER_ROW) ?? null;
		if (!row || e.buttons !== 0) return this.hide();
		if (row !== this.row || !this.tip) {
			const folder = this.folderOf(row);
			if (!folder) return this.hide();
			this.show(row, folder);
		}
		this.place(e.clientX, e.clientY);
	}

	private folderOf(row: HTMLElement): TFolder | null {
		const path = row.getAttribute("data-path");
		if (path === null) return null;
		const file = path === "/" || path === "" ? this.app.vault.getRoot() : this.app.vault.getAbstractFileByPath(path);
		return file instanceof TFolder ? file : null;
	}

	private show(row: HTMLElement, folder: TFolder) {
		this.hide();
		const direct: Counts = { folders: 0, files: 0, notes: 0 };
		for (const child of folder.children) {
			if (child instanceof TFolder) direct.folders++;
			else {
				direct.files++;
				if (isNote(child)) direct.notes++;
			}
		}
		const all = this.totals(folder);

		const tip = document.body.createDiv({ cls: TIP_CLASS });
		tip.createDiv({ cls: "folder-stats-direct", text: line(direct) });
		tip.createDiv({
			cls: "folder-stats-all",
			text: `all levels: ${line(all)}, ${plural(all.notes, "note", "notes")}`,
		});
		this.tip = tip;
		this.row = row;
	}

	private totals(folder: TFolder): Counts {
		const cached = this.cache.get(folder.path);
		if (cached) return cached;
		const sum: Counts = { folders: 0, files: 0, notes: 0 };
		const walk = (dir: TFolder) => {
			for (const child of dir.children) {
				if (child instanceof TFolder) {
					sum.folders++;
					walk(child);
				} else {
					sum.files++;
					if (isNote(child)) sum.notes++;
				}
			}
		};
		walk(folder);
		this.cache.set(folder.path, sum);
		return sum;
	}

	private place(x: number, y: number) {
		const tip = this.tip;
		if (!tip) return;
		const width = tip.offsetWidth;
		const height = tip.offsetHeight;
		// Flip to the left of / above the mouse only when there is no room on the right / below.
		const left = x + OFFSET_X + width > window.innerWidth ? Math.max(0, x - OFFSET_X - width) : x + OFFSET_X;
		const top = y + OFFSET_Y + height > window.innerHeight ? Math.max(0, y - OFFSET_Y - height) : y + OFFSET_Y;
		tip.style.left = `${left}px`;
		tip.style.top = `${top}px`;
	}

	private hide() {
		this.tip?.remove();
		this.tip = null;
		this.row = null;
	}
}
