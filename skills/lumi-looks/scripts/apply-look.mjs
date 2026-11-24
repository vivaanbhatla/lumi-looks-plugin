#!/usr/bin/env node
/* Change how Lumi (Jugnu), the firefly of samajh.me, is drawn.

   Samajh draws its firefly in two places, both inline SVG strings:
     - function fireflySVG()   the firefly that flies over the home screen
     - const JUGNU_MASCOT      the mascot beside sign-in and on the review screens
   This script swaps both for a picture from ../looks, embedded as a data: URI
   (the page loads no external images), and keeps the originals inside a marked
   block so `original` puts everything back exactly as it was.

   Usage
     node apply-look.mjs --list
     node apply-look.mjs <look> [--site <dir>] [--file <path>] [--dry-run]
     node apply-look.mjs original [--site <dir>] [--file <path>]
     node apply-look.mjs --status [--site <dir>] [--file <path>]

   No dependencies; Node 18+. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LOOKS_DIR = path.join(HERE, '..', 'looks');
const START = '/* lumi-look:start';
const END = '/* lumi-look:end */';

export function loadLooks() {
  return JSON.parse(fs.readFileSync(path.join(LOOKS_DIR, 'looks.json'), 'utf8')).looks;
}
export function dataUri(look) {
  const ext = path.extname(look.file).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  return 'data:image/' + mime + ';base64,' + fs.readFileSync(path.join(LOOKS_DIR, look.file)).toString('base64');
}

/* Where the picture goes. Both drawings pulse their glow around (60,70): the
   site's CSS has that point as the transform origin. So the picture is placed
   with its lantern on (60,70) and made as large as `box` allows. */
function place(look, box, want) {
  const ar = look.height / look.width, lx = look.lamp.x, ly = look.lamp.y;
  let w = want;
  w = Math.min(w, (60 - box.x0) / lx, (box.x1 - 60) / (1 - lx), (70 - box.y0) / (ly * ar), (box.y1 - 70) / ((1 - ly) * ar));
  const h = w * ar, f = n => +n.toFixed(2);
  return {x: f(60 - lx * w), y: f(70 - ly * h), w: f(w), h: f(h), r: f(Math.max(7, look.lamp.r * w * 1.5))};
}
const GLOW = id =>
  '<radialGradient id="' + id + '" cx="50%" cy="50%" r="50%">' +
  '<stop offset="0" stop-color="#FFFBE6" stop-opacity=".95"/>' +
  '<stop offset="45%" stop-color="#FFD86B" stop-opacity=".45"/>' +
  '<stop offset="100%" stop-color="#FFD86B" stop-opacity="0"/></radialGradient>';

/* The flying firefly: same viewBox and classes as the original, so the drift
   (.ffbody) and the breathing lantern (.ffhalo, .fflamp) keep working. */
export function flySVG(look, href) {
  const p = place(look, {x0: -8, x1: 128, y0: -16, y1: 128}, 104);
  return '<svg class="ffly" viewBox="0 0 120 130" aria-hidden="true">' +
    '<defs><radialGradient id="ffg" cx="50%" cy="54%" r="50%">' +
    '<stop offset="0" stop-color="#FFF6D2" stop-opacity=".95"/>' +
    '<stop offset="40%" stop-color="#EFCE6B" stop-opacity=".5"/>' +
    '<stop offset="100%" stop-color="#EFCE6B" stop-opacity="0"/>' +
    '</radialGradient>' + GLOW('ffl') + '</defs>' +
    '<g class="ffbody">' +
    '<circle class="ffhalo" cx="60" cy="70" r="46" fill="url(#ffg)"/>' +
    '<image href="' + href + '" x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '"/>' +
    '<circle class="fflamp" cx="60" cy="70" r="' + p.r + '" fill="url(#ffl)"/>' +
    '</g></svg>';
}
/* The mascot: same viewBox and classes (.jm hovers, .jm-halo glows). Its SVG
   clips at the edge, so the picture is fitted to the box rather than hung
   from its lantern, and the halo is carried to the lantern inside a moved
   group: within that group it still sits at (60,70), where the CSS pulses it. */
export function mascotSVG(look, href) {
  const ar = look.height / look.width, f = n => +n.toFixed(2);
  const w = Math.min(108, 108 / ar), h = w * ar, x = 60 - w / 2, y = 60 - h / 2;
  const lx = x + look.lamp.x * w, ly = y + look.lamp.y * h;
  const r = Math.min(40, lx - 1, 119 - lx, ly - 1, 119 - ly);
  return '<svg viewBox="0 0 120 120" aria-hidden="true">' +
    '<defs><radialGradient id="jmHalo" cx="50%" cy="50%" r="50%">' +
    '<stop offset="0" stop-color="#FDE68A" stop-opacity=".85"/>' +
    '<stop offset="55%" stop-color="#FBBF24" stop-opacity=".32"/>' +
    '<stop offset="100%" stop-color="#FBBF24" stop-opacity="0"/></radialGradient></defs>' +
    '<g class="jm">' +
    '<g transform="translate(' + f(lx - 60) + ' ' + f(ly - 70) + ')"><circle class="jm-halo" cx="60" cy="70" r="' + f(r) + '" fill="url(#jmHalo)"/></g>' +
    '<image href="' + href + '" x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '"/>' +
    '</g></svg>';
}

/* ---- reading the site's JavaScript without a parser ---------------------- */
/* Index just past the statement that starts at `from`: for a function, past
   its closing brace; for a const, past its semicolon. Strings, template
   strings and comments are skipped, so braces and semicolons in them are not
   counted. */
function endOf(src, from, kind) {
  let i = from, depth = 0, seen = false;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (c === '/' && n === '*') { i = src.indexOf('*/', i + 2); if (i < 0) break; i += 2; continue; }
    if (c === '/' && n === '/') { i = src.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === "'" || c === '"' || c === '`') {
      i++;
      while (i < src.length && src[i] !== c) i += src[i] === '\\' ? 2 : 1;
      i++; continue;
    }
    if (c === '{' || c === '(' || c === '[') { depth++; seen = true; }
    else if (c === '}' || c === ')' || c === ']') {
      depth--;
      if (kind === 'function' && c === '}' && depth === 0 && seen) return i + 1;
    } else if (c === ';' && depth === 0 && kind === 'const') return i + 1;
    i++;
  }
  throw new Error('Could not find where the ' + kind + ' ends; the file may not be the page this script expects.');
}
const jsStr = s => "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";

const TARGETS = [
  {key: 'fly', head: 'function fireflySVG(){', kind: 'function', name: 'fireflySVG', spare: 'fireflySVG__original',
    make: (look) => 'function fireflySVG(){\n  return ' + jsStr(flySVG(look, '\u0000')).replace('\u0000', "'+LUMI_LOOK_IMG+'") + ';\n}'},
  {key: 'mascot', head: 'const JUGNU_MASCOT=', kind: 'const', name: 'JUGNU_MASCOT', spare: 'JUGNU_MASCOT__original',
    make: (look) => 'const JUGNU_MASCOT=' + jsStr(mascotSVG(look, '\u0000')).replace('\u0000', "'+LUMI_LOOK_IMG+'") + ';'},
];

/* Take every managed block out and put the original statement back. */
export function restore(src) {
  let out = src, count = 0, look = null;
  for (;;) {
    const s = out.indexOf(START);
    if (s < 0) break;
    const e = out.indexOf(END, s);
    if (e < 0) throw new Error('Found a lumi-look block with no end marker; fix it by hand.');
    const block = out.slice(s, e);
    look = look || (block.match(/lumi-look:start (\S+)/) || [])[1] || null;
    const a = block.indexOf('/* lumi-look:original */'), b = block.indexOf('/* lumi-look:new */');
    if (a < 0 || b < 0) throw new Error('A lumi-look block is damaged (the kept original is missing); fix it by hand.');
    let orig = block.slice(a + '/* lumi-look:original */'.length, b).replace(/^\n/, '').replace(/\n$/, '');
    for (const t of TARGETS) orig = orig.replace(t.spare, t.name);
    out = out.slice(0, s) + orig + out.slice(e + END.length);
    count++;
  }
  return {src: out, count, look};
}

export function apply(src, look) {
  const clean = restore(src).src;
  const found = TARGETS.map(t => ({t, at: clean.indexOf(t.head)})).filter(x => x.at >= 0).sort((p, q) => q.at - p.at);
  if (!found.length) throw new Error('Neither fireflySVG() nor JUGNU_MASCOT is in this file.');
  const first = found[found.length - 1].t.key;   // earliest in the file carries the picture
  let out = clean;
  for (const {t, at} of found) {                 // last first, so earlier offsets stay true
    if (clean.indexOf(t.head, at + 1) >= 0) throw new Error(t.name + ' is defined more than once in this file.');
    const end = endOf(clean, at, t.kind);
    const orig = clean.slice(at, end).replace(t.name, t.spare);
    const block =
      START + ' ' + look.id + ' — drawn by the lumi-looks plugin; `apply-look.mjs original` undoes it */\n' +
      (t.key === first ? 'const LUMI_LOOK_IMG=' + jsStr(dataUri(look)) + ';\n' : '') +
      '/* lumi-look:original */\n' + orig + '\n/* lumi-look:new */\n' + t.make(look) + '\n' + END;
    out = out.slice(0, at) + block + out.slice(end);
  }
  return {src: out, replaced: found.map(x => x.t.name).reverse(), missing: TARGETS.filter(t => !found.some(x => x.t === t)).map(t => t.name)};
}

/* ---- finding the page ----------------------------------------------------- */
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.wrangler', '.cache', 'coverage']);
export function findPages(dir) {
  const hits = [];
  (function walk(d, depth) {
    if (depth > 6) return;
    for (const e of fs.readdirSync(d, {withFileTypes: true})) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (!SKIP.has(e.name) && !e.name.startsWith('.')) walk(p, depth + 1); continue; }
      if (!/\.(html?|m?js|ts)$/i.test(e.name)) continue;
      if (fs.statSync(p).size > 20 * 1024 * 1024) continue;
      const s = fs.readFileSync(p, 'utf8');
      if (TARGETS.some(t => s.includes(t.head) || s.includes(t.head.replace(t.name, t.spare)))) hits.push(p);
    }
  })(dir, 0);
  return hits;
}

function main() {
  const argv = process.argv.slice(2);
  const opt = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  const flag = n => argv.includes(n);
  const looks = loadLooks();
  if (flag('--list') || !argv.length) {
    console.log('Looks:');
    for (const l of looks) console.log('  ' + l.id.padEnd(11) + l.description);
    console.log('  ' + 'original'.padEnd(11) + "Samajh's own drawing (undoes a look).");
    return;
  }
  let files = opt('--file') ? [path.resolve(opt('--file'))] : findPages(path.resolve(opt('--site') || '.'));
  if (!files.length) throw new Error('No file here defines fireflySVG() or JUGNU_MASCOT. Run this in the samajh.me repository, or pass --site <dir> or --file <path>.');
  if (flag('--status')) {
    for (const f of files) {
      const m = fs.readFileSync(f, 'utf8').match(/lumi-look:start (\S+)/);
      console.log(f + ': ' + (m ? m[1] : 'original'));
    }
    return;
  }
  const want = argv.find(a => !a.startsWith('--') && a !== opt('--site') && a !== opt('--file'));
  if (!want) throw new Error('Say which look: ' + looks.map(l => l.id).join(', ') + ', or original.');
  const look = looks.find(l => l.id === want.toLowerCase());
  if (!look && want !== 'original') throw new Error('No look called "' + want + '". Looks: ' + looks.map(l => l.id).join(', ') + ', original.');
  if (files.length > 1) {
    console.log('More than one file draws Lumi; changing all of them (pass --file to pick one):');
  }
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    let out, note;
    if (!look) {
      const r = restore(src);
      out = r.src; note = r.count ? 'back to the original drawing (was ' + r.look + ')' : 'already the original drawing';
    } else {
      const r = apply(src, look);
      out = r.src;
      note = look.id + ' applied to ' + r.replaced.join(' and ') + (r.missing.length ? ' (not in this file: ' + r.missing.join(', ') + ')' : '') +
        ' (page is ' + Math.round((Buffer.byteLength(out) - Buffer.byteLength(restore(src).src)) / 1024) + ' KB larger than with the original drawing)';
    }
    if (!flag('--dry-run') && out !== src) fs.writeFileSync(f, out);
    console.log((flag('--dry-run') ? '[dry run] ' : '') + f + ': ' + note);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) { console.error('lumi-look: ' + e.message); process.exit(1); }
}
