"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => FolderStatsPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var FOLDER_ROW = ".nav-files-container .nav-folder-title";
var TIP_CLASS = "folder-stats-tip";
var OFFSET_X = 18;
var OFFSET_Y = 12;
var FolderStatsPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.tip = null;
    this.row = null;
    // Totals per folder path, thrown away whenever something is created, deleted or renamed.
    this.cache = /* @__PURE__ */ new Map();
  }
  onload() {
    const clear = () => this.cache.clear();
    this.registerEvent(this.app.vault.on("create", clear));
    this.registerEvent(this.app.vault.on("delete", clear));
    this.registerEvent(this.app.vault.on("rename", clear));
    this.registerDomEvent(document, "mousemove", (e) => this.move(e));
    this.registerDomEvent(document, "mousedown", () => this.hide());
    this.registerDomEvent(document, "dragstart", () => this.hide());
    this.registerDomEvent(document, "mouseleave", () => this.hide());
    this.registerDomEvent(window, "blur", () => this.hide());
  }
  onunload() {
    this.hide();
  }
  move(e) {
    const target = e.target instanceof Element ? e.target : null;
    const row = target?.closest(FOLDER_ROW) ?? null;
    if (!row || e.buttons !== 0) return this.hide();
    if (row !== this.row || !this.tip) {
      const folder = this.folderOf(row);
      if (!folder) return this.hide();
      this.show(row, folder);
    }
    this.place(e.clientX, e.clientY);
  }
  folderOf(row) {
    const path = row.getAttribute("data-path");
    if (path === null) return null;
    const file = path === "/" || path === "" ? this.app.vault.getRoot() : this.app.vault.getAbstractFileByPath(path);
    return file instanceof import_obsidian.TFolder ? file : null;
  }
  show(row, folder) {
    this.hide();
    const all = this.totals(folder);
    const tip = document.body.createDiv({ cls: TIP_CLASS });
    tip.createDiv({ cls: "folder-stats-totals", text: `Total folders: ${all.folders} \xB7 Total files: ${all.files}` });
    tip.createDiv({
      cls: "folder-stats-depth",
      text: `Folders until file: ${all.depth < 0 ? "no files" : all.depth}`
    });
    this.tip = tip;
    this.row = row;
  }
  totals(folder) {
    const cached = this.cache.get(folder.path);
    if (cached) return cached;
    const sum = { folders: 0, files: 0, depth: -1 };
    const walk = (dir, level) => {
      for (const child of dir.children) {
        if (child instanceof import_obsidian.TFolder) {
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
  place(x, y) {
    const tip = this.tip;
    if (!tip) return;
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    const left = x + OFFSET_X + width > window.innerWidth ? Math.max(0, x - OFFSET_X - width) : x + OFFSET_X;
    const top = y + OFFSET_Y - height < 0 ? y + OFFSET_Y : y + OFFSET_Y - height;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }
  hide() {
    this.tip?.remove();
    this.tip = null;
    this.row = null;
  }
};
