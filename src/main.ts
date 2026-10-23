import { Plugin, TFolder } from "obsidian";

const FOLDER_ROW = ".nav-files-container .nav-folder-title";
const TIP_CLASS = "folder-stats-tip";
// The tooltip sits this far right of the mouse, with its bottom edge this far below it.
const OFFSET_X = 18;
const OFFSET_Y = 12;

interface Counts {
	folders: number;
	files: number;
	// Folders to go through, below this one, to reach its furthest file; -1 when it holds no files.
	depth: number;
}

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
		const all = this.totals(folder);

		const tip = document.body.createDiv({ cls: TIP_CLASS });
		tip.createDiv({ cls: "folder-stats-totals", text: `Total folders: ${all.folders} · Total files: ${all.files}` });
		tip.createDiv({
			cls: "folder-stats-depth",
			text: `Folders until file: ${all.depth < 0 ? "no files" : all.depth}`,
		});
		this.tip = tip;
		this.row = row;
	}

	private totals(folder: TFolder): Counts {
		const cached = this.cache.get(folder.path);
		if (cached) return cached;
		const sum: Counts = { folders: 0, files: 0, depth: -1 };
		const walk = (dir: TFolder, level: number) => {
			for (const child of dir.children) {
				if (child instanceof TFolder) {
					sum.folders++;
					walk(child, level + 1);
				} else {
					sum.files++;
					sum.depth = Math.max(sum.depth, level);
				}
			}
		};
		walk(folder, 0);
		this.cache.set(folder.path, sum);
		return sum;
	}

	private place(x: number, y: number) {
		const tip = this.tip;
		if (!tip) return;
		const width = tip.offsetWidth;
		const height = tip.offsetHeight;
		// The bottom edge sits OFFSET_Y below the mouse. Flip to the left of the mouse only when there is
		// no room on the right, and below it only when there is no room above.
		const left = x + OFFSET_X + width > window.innerWidth ? Math.max(0, x - OFFSET_X - width) : x + OFFSET_X;
		const top = y + OFFSET_Y - height < 0 ? y + OFFSET_Y : y + OFFSET_Y - height;
		tip.style.left = `${left}px`;
		tip.style.top = `${top}px`;
	}

	private hide() {
		this.tip?.remove();
		this.tip = null;
		this.row = null;
	}
}
