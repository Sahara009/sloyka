// Пересчитывает src/data/images.ts: размеры всех картинок из public/products, public/photos и т.д.
// Запуск после добавления фото:  npm run images
// Поддерживаются webp, png, jpg. Размеры нужны, чтобы страница не «прыгала» при загрузке фото.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pub = join(root, "public");

function size(buf, ext) {
  if (ext === ".png") return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  if (ext === ".jpg" || ext === ".jpeg") {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  if (ext === ".webp") {
    const kind = buf.toString("ascii", 12, 16);
    if (kind === "VP8 ") return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
    if (kind === "VP8L") { const b = buf.readUInt32LE(21); return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1]; }
    if (kind === "VP8X") return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
  }
  return null;
}

const out = {};
const walk = (d) => {
  for (const name of readdirSync(d).sort()) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) walk(p);
    else {
      const ext = extname(name).toLowerCase();
      if (![".webp", ".png", ".jpg", ".jpeg"].includes(ext)) continue;
      const s = size(readFileSync(p), ext);
      if (s) out["/" + p.slice(pub.length + 1).replace(/\\/g, "/")] = s;
      else console.warn("не удалось прочитать размер:", p);
    }
  }
};
walk(pub);

const lines = Object.entries(out).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `  "${k}": [${v[0]}, ${v[1]}],`);
writeFileSync(
  join(root, "src/data/images.ts"),
  `// Размеры картинок (сгенерировано скриптом scripts/image-sizes.mjs: npm run images). Нужны, чтобы страница не прыгала при загрузке фото.\nexport const imageSizes: Record<string, [number, number]> = {\n${lines.join("\n")}\n};\n`,
);
console.log(`image-sizes: ${lines.length} картинок`);
