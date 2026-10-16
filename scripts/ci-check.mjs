#!/usr/bin/env node
// Dependency-free structural checks for the static portfolio.
// Validates: HTML tag balance, duplicate IDs, in-page anchors, local file
// references and CSS brace balance. Exits non-zero on any failure.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VOID = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const HTML_FILES = ['index.html', 'cv.html', '404.html'];

let failures = 0;
const fail = (msg) => { failures++; console.error('  FAIL ' + msg); };
const ok = (msg) => console.log('  ok   ' + msg);

function stripNoise(html) {
    return html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<script\b[\s\S]*?<\/script>/gi, '')
        .replace(/<style\b[\s\S]*?<\/style>/gi, '');
}

function checkTagBalance(name, html) {
    const src = stripNoise(html);
    const stack = [];
    const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/g;
    let m;
    while ((m = re.exec(src))) {
        const closing = m[1] === '/';
        const tag = m[2].toLowerCase();
        const selfClose = m[4] === '/';
        if (VOID.has(tag) || selfClose) continue;
        if (closing) {
            if (stack.length && stack[stack.length - 1] === tag) stack.pop();
            else if (stack.includes(tag)) fail(`${name}: mismatched </${tag}> (open: ${stack[stack.length - 1]})`);
            else fail(`${name}: stray </${tag}>`);
        } else {
            stack.push(tag);
        }
    }
    if (stack.length) fail(`${name}: unclosed tags -> ${stack.join(', ')}`);
    else ok(`${name}: tags balanced`);
}

function idsOf(html) {
    const ids = new Map();
    const re = /\sid="([^"]+)"/g;
    let m;
    while ((m = re.exec(html))) ids.set(m[1], (ids.get(m[1]) || 0) + 1);
    return ids;
}

function checkIds(name, html) {
    const ids = idsOf(html);
    const dupes = [...ids.entries()].filter(([, c]) => c > 1);
    if (dupes.length) fail(`${name}: duplicate id(s): ${dupes.map(([k]) => k).join(', ')}`);
    else ok(`${name}: ${ids.size} unique ids`);
    return new Set(ids.keys());
}

function checkAnchors(name, html, ids) {
    const bad = [];
    const re = /href="#([^"]+)"/g;
    let m;
    while ((m = re.exec(html))) if (!ids.has(m[1])) bad.push(m[1]);
    if (bad.length) fail(`${name}: anchors with no target: ${[...new Set(bad)].join(', ')}`);
    else ok(`${name}: in-page anchors resolve`);
}

function checkLocalRefs(name, html) {
    const bad = [];
    const re = /(?:href|src)="([^"]+)"/g;
    let m;
    while ((m = re.exec(html))) {
        let ref = m[1].trim();
        if (!ref || ref.startsWith('#')) continue;
        if (/^(https?:|mailto:|tel:|data:|sms:)/i.test(ref)) continue;
        ref = ref.split('#')[0].split('?')[0];
        if (!ref) continue;
        if (!existsSync(join(root, ref))) bad.push(ref);
    }
    if (bad.length) fail(`${name}: missing local file(s): ${[...new Set(bad)].join(', ')}`);
    else ok(`${name}: local references exist`);
}

function checkCss(file) {
    const css = readFileSync(join(root, file), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '');
    let depth = 0, min = 0;
    for (const ch of css) {
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth < min) min = depth; }
    }
    if (depth !== 0 || min < 0) fail(`${file}: unbalanced braces (final depth ${depth})`);
    else ok(`${file}: braces balanced`);
}

console.log('== HTML ==');
for (const f of HTML_FILES) {
    const html = readFileSync(join(root, f), 'utf8');
    checkTagBalance(f, html);
    const ids = checkIds(f, html);
    checkAnchors(f, html, ids);
    checkLocalRefs(f, html);
}
console.log('== CSS ==');
checkCss('styles.css');

console.log('');
if (failures) { console.error(`${failures} check(s) failed`); process.exit(1); }
console.log('All checks passed');
