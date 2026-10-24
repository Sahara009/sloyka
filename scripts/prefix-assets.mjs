// После статической сборки: на GitHub Pages сайт живёт в подпапке (/имя-репозитория/),
// поэтому пути к картинкам вида "/photos/…" нужно дополнить этим префиксом.
// Использование: node scripts/prefix-assets.mjs <папка out> <base, например /sloyka.home>
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [dir, baseRaw] = process.argv.slice(2);
const base = (baseRaw ?? "").replace(/\/$/, "");
if (!dir) throw new Error("Укажите папку сборки");
if (!base) process.exit(0);

const re = /(["'`(=])\/(photos|products|shapes|logo|logo-light|favicon|icon|og)([/.\-"'`)])/g;
const exts = new Set([".html", ".js", ".css", ".txt", ".json", ".xml", ".svg"]);
let changed = 0;

const walk = (d) => {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (exts.has(name.slice(name.lastIndexOf(".")))) {
      const src = readFileSync(p, "utf8");
      const out = src.replace(re, (_, a, b, c) => `${a}${base}/${b}${c}`);
      if (out !== src) {
        writeFileSync(p, out);
        changed++;
      }
    }
  }
};
walk(dir);
console.log(`prefix-assets: обновлено файлов — ${changed}`);
