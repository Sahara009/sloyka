// Сборка демо для GitHub Pages: node scripts/build-demo.mjs [/base-path]
// Копирует проект во временную папку .demo-build, убирает серверные части (api, admin),
// собирает статический сайт и кладёт результат в ./out
import { cpSync, existsSync, rmSync, symlinkSync, writeFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = process.cwd();
const tmp = join(root, ".demo-build");
const base = (process.argv[2] ?? process.env.DEMO_BASE_PATH ?? "").replace(/\/$/, "");

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp);
const skip = new Set(["node_modules", ".next", "out", ".demo-build", ".git"]);
for (const name of ["src", "public", "prisma", "scripts", "package.json", "tsconfig.json", "next.config.ts", "next-env.d.ts"]) {
  if (existsSync(join(root, name))) cpSync(join(root, name), join(tmp, name), { recursive: true, filter: (s) => !skip.has(s.split(/[\\/]/).pop()) });
}
symlinkSync(join(root, "node_modules"), join(tmp, "node_modules"), "junction");

// на статическом сайте нет сервера: убираем API и админку
rmSync(join(tmp, "src/app/api"), { recursive: true, force: true });
rmSync(join(tmp, "src/app/admin"), { recursive: true, force: true });
// robots/sitemap: делаем статическими
for (const f of ["robots.ts", "sitemap.ts"]) {
  const p = join(tmp, "src/app", f);
  if (existsSync(p)) {
    const s = (await import("node:fs")).readFileSync(p, "utf8");
    writeFileSync(p, `export const dynamic = "force-static";\n${s}`);
  }
}

const env = { ...process.env, DEMO_EXPORT: "1", NEXT_PUBLIC_DEMO: "1", DEMO_BASE_PATH: base, NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? `https://example.github.io${base}` };
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: tmp, stdio: "inherit", env, shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run("npx", ["next", "build"]);
run("node", ["scripts/prefix-assets.mjs", "out", base]);
writeFileSync(join(tmp, "out/.nojekyll"), "");
// SPA-запасной вариант для неизвестных адресов
if (existsSync(join(tmp, "out/404.html")) === false && existsSync(join(tmp, "out/_not-found/index.html"))) cpSync(join(tmp, "out/_not-found/index.html"), join(tmp, "out/404.html"));

rmSync(join(root, "out"), { recursive: true, force: true });
cpSync(join(tmp, "out"), join(root, "out"), { recursive: true });
rmSync(tmp, { recursive: true, force: true });
console.log(`\nГотово: папка out/ (base="${base}"). Локально посмотреть: npx serve out`);
