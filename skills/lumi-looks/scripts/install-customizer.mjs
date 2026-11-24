#!/usr/bin/env node
/* Add "choose your firefly" to samajh.me.

   After this, Settings has a card where the firefly (Classic, Auto, Graduate,
   Glossy) and the colour of its light are chosen. Everyone starts with
   Classic, the firefly Samajh draws today. Auto follows the age band: Classic
   to ten, Graduate from eleven to seventeen, Glossy for 18+.
   The code that is added is ../customizer/runtime.js; this script puts it in
   the page with the pictures from ../looks and connects it in six places.

   Every edit is wrapped in a marker that carries the text it replaced, so
   `--remove` restores the file byte for byte.

   Usage
     node install-customizer.mjs [--site <dir>] [--file <path>] [--dry-run]
     node install-customizer.mjs --remove [--site <dir>] [--file <path>]
     node install-customizer.mjs --status [--site <dir>] [--file <path>]

   No dependencies; Node 18+. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {loadLooks, dataUri, vectorInner, layersOf, animCss, findPages} from './apply-look.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const A = '/*lumi-c[*/', M = '/*lumi-c|', Z = ']lumi-c*/';
const mark = (neu, old = '') => {
  if (old.includes('*/') || neu.includes(M)) throw new Error('Cannot wrap this edit safely.');
  return A + neu + M + old + Z;
};
const REMOVE = /\/\*lumi-c\[\*\/[\s\S]*?\/\*lumi-c\|([\s\S]*?)\]lumi-c\*\//g;

/* The three looks the picker offers, as the page needs them. */
export function artData() {
  const out = {};
  for (const l of loadLooks()) {
    const at = {w: l.width, h: l.height, lx: l.lamp.x, ly: l.lamp.y, lr: l.lamp.r};
    out[l.id] = l.vector ? {svg: vectorInner(l), ...at}
      : {...at, layers: layersOf(l).map(L => ({img: dataUri(L.file), mask: L.mask ? dataUri(L.mask) : undefined, x: L.x, y: L.y, w: L.w, h: L.h, c: L.class, o: L.origin, v: L.vars}))};
  }
  for (const k of ['professor', 'glass']) if (!out[k]) throw new Error('looks.json has no "' + k + '" look; the picker needs professor and glass.');
  return out;
}
export function runtime() {
  const src = fs.readFileSync(path.join(HERE, '..', 'customizer', 'runtime.js'), 'utf8');
  const art = JSON.stringify(artData());
  /* The site rewrites the word Jugnu in everything it draws; a picture must not contain it by chance. */
  if (/\bJugnu\b|\bApne\b|\bShabash\b|@jugnu\b/.test(art)) throw new Error('A picture happens to contain a word the site rewrites; re-save that picture.');
  return src.replace('__LUMI_CSS__', () => JSON.stringify(animCss())).replace('__LUMI_ART__', () => art);
}

export function remove(src) {
  let n = 0;
  const out = src.replace(REMOVE, (_, old) => { n++; return old; });
  return {src: out, count: n};
}

function once(src, needle, what) {
  const i = src.indexOf(needle);
  if (i < 0) throw new Error('Could not find ' + what + ' (`' + needle + '`). The site code has changed; see the skill for what each edit does.');
  if (src.indexOf(needle, i + 1) >= 0) throw new Error(what + ' (`' + needle + '`) appears more than once; pass --file for the one source file.');
  return i;
}
const ins = (src, i, text) => src.slice(0, i) + text + src.slice(i);

export function install(src0) {
  if (src0.includes('/* lumi-look:start')) throw new Error('A fixed look is applied to this file. Run `apply-look.mjs original` first; the customizer replaces it.');
  let src = remove(src0).src;
  const looks = "lumi:['classic','auto','professor','glass'],lumiGlow:['yellow','orange','pink','green','blue','purple','white'],";
  let i;
  /* 1. the two settings are known values, so they load and save like the theme */
  i = once(src, 'const SET_KEYS={', 'the list of settings');
  src = ins(src, i + 'const SET_KEYS={'.length, mark(looks));
  /* 2. their defaults */
  i = once(src, 'S.set={start:', 'the default settings');
  src = ins(src, i + 'S.set={'.length, mark("lumi:'classic',lumiGlow:'yellow',"));
  /* 3. the drawn firefly becomes the Classic look; the new code goes in front of it */
  i = once(src, 'function fireflySVG(){', 'the flying firefly');
  src = src.slice(0, i) + mark(runtime() + '\n') + 'function ' + mark('fireflySVG__classic', 'fireflySVG') + src.slice(i + 'function fireflySVG'.length);
  /* 4. redraw the flying firefly when the choice or the age band changes */
  i = once(src, 'function flyPlace(){', 'where the firefly is placed');
  src = ins(src, i + 'function flyPlace(){'.length, mark('lumiSync();'));
  /* 5. every place the mascot is written asks for the chosen one */
  const use = "'+JUGNU_MASCOT+'";
  const uses = src.split(use).length - 1;
  if (!uses) throw new Error('Could not find where the mascot is used (`' + use + '`).');
  src = src.split(use).join("'+" + mark('lumiMascot()', 'JUGNU_MASCOT') + "+'");
  if (!src.includes('const JUGNU_MASCOT=')) throw new Error('Could not find the mascot drawing (`const JUGNU_MASCOT=`).');
  /* 6. the card in Settings, after "The look" */
  const v = once(src, 'V.settings=function(){', 'the Settings screen');
  i = src.indexOf('namesCard()+', v);
  if (i < 0) throw new Error('Could not find where to put the card in Settings (`namesCard()+` after `V.settings`).');
  src = ins(src, i, mark('lumiCard()+'));
  return {src, mascotUses: uses};
}

function main() {
  const argv = process.argv.slice(2);
  const opt = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  const flag = n => argv.includes(n);
  const files = opt('--file') ? [path.resolve(opt('--file'))] : findPages(path.resolve(opt('--site') || '.'));
  if (!files.length) throw new Error('No file here defines fireflySVG() or JUGNU_MASCOT. Run this in the samajh.me repository, or pass --site <dir> or --file <path>.');
  if (files.length > 1 && !flag('--status')) throw new Error('More than one file draws Lumi:\n  ' + files.join('\n  ') + '\nPass --file with the source file (not a built copy).');
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const has = src.includes(A);
    if (flag('--status')) { console.log(f + ': customizer ' + (has ? 'installed' : 'not installed')); continue; }
    let out, note;
    if (flag('--remove')) {
      const r = remove(src);
      out = r.src; note = r.count ? 'customizer removed (' + r.count + ' edits undone)' : 'customizer was not installed';
    } else {
      const r = install(src);
      out = r.src;
      note = 'customizer ' + (has ? 'updated' : 'installed') + ' (mascot used in ' + r.mascotUses + ' places; page is ' +
        Math.round((Buffer.byteLength(out) - Buffer.byteLength(remove(src).src)) / 1024) + ' KB larger)';
    }
    if (!flag('--dry-run') && out !== src) fs.writeFileSync(f, out);
    console.log((flag('--dry-run') ? '[dry run] ' : '') + f + ': ' + note);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (e) { console.error('lumi-customizer: ' + e.message); process.exit(1); }
}
