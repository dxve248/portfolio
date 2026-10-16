#!/usr/bin/env node
// Optional production build: minifies CSS/JS and emits a ready-to-serve
// `dist/` folder with content-hashed asset versions for cache-busting.
// The source files in the repo root stay readable; this does not modify them.
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url)).replace(/[\\/]scripts$/, '');
const dist = join(root, 'dist');

const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 8);
const kb = (p) => (statSync(p).size / 1024).toFixed(1) + ' KB';

async function minify(file, loader) {
    const src = readFileSync(join(root, file), 'utf8');
    const out = await build({
        stdin: { contents: src, loader, sourcefile: file },
        minify: true,
        write: false,
        target: 'es2019',
        legalComments: 'none'
    });
    return out.outputFiles[0].text;
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(join(dist, 'assets'), { recursive: true });

const css = await minify('styles.css', 'css');
const js = await minify('main.js', 'js');
const mesh = await minify('assets/hero-mesh.js', 'js');

writeFileSync(join(dist, 'styles.css'), css);
writeFileSync(join(dist, 'main.js'), js);

const v = { css: hash(css), js: hash(js), mesh: hash(mesh) };

for (const f of ['robots.txt', 'sitemap.xml', 'site.webmanifest']) cpSync(join(root, f), join(dist, f));
cpSync(join(root, 'assets'), join(dist, 'assets'), { recursive: true });
writeFileSync(join(dist, 'assets', 'hero-mesh.js'), mesh);

for (const f of ['index.html', 'cv.html', '404.html']) {
    let html = readFileSync(join(root, f), 'utf8');
    html = html
        .replace(/styles\.css(\?v=[^"']*)?/, `styles.css?v=${v.css}`)
        .replace(/(\.\/)?main\.js(\?v=[^"']*)?/, `main.js?v=${v.js}`)
        .replace(/(\.\/)?assets\/hero-mesh\.js(\?v=[^"']*)?/, `assets/hero-mesh.js?v=${v.mesh}`);
    writeFileSync(join(dist, f), html);
}

console.log('Built dist/');
console.log('  styles.css   ', kb(join(dist, 'styles.css')), '| v=' + v.css);
console.log('  main.js      ', kb(join(dist, 'main.js')), '| v=' + v.js);
console.log('  hero-mesh.js ', kb(join(dist, 'assets', 'hero-mesh.js')), '| v=' + v.mesh);
