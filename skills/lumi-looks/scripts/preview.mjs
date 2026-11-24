#!/usr/bin/env node
/* Write one HTML page showing every look the way Samajh will draw it: the
   flying firefly and the sign-in mascot, on a light and a dark background,
   with the site's own motion. Open it in a browser to choose.

   Usage: node preview.mjs [out.html]      (default: ./lumi-looks-preview.html) */
import fs from 'node:fs';
import path from 'node:path';
import {loadLooks, dataUri, layersOf, animCss, flySVG, mascotSVG} from './apply-look.mjs';

const out = path.resolve(process.argv[2] || 'lumi-looks-preview.html');
const cards = loadLooks().map(l => {
  const uris = layersOf(l).map(L => dataUri(L.file)), uri = i => uris[i];
  const cell = cls => '<div class="cell ' + cls + '"><div class="vfly">' + flySVG(l, uri) + '</div><div class="mascot">' + mascotSVG(l, uri) + '</div></div>';
  return '<section><h2>' + l.name + ' <code>' + l.id + '</code></h2><p>' + l.description + '</p><div class="row">' + cell('light') + cell('dark') + '</div></section>';
}).join('\n');

/* The motion below is copied from samajh.me so the preview moves as the site does. */
const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lumi looks</title>
<style>
body{font:16px/1.5 system-ui,sans-serif;margin:0;padding:28px;background:#f4f1ea;color:#2a2430}
h1{margin:0 0 4px}h2{margin:0}section{margin:28px 0}p{margin:2px 0 12px;color:#5b5563}
code{font-size:.8em;background:#e7e2d6;padding:2px 7px;border-radius:6px}
.row{display:flex;gap:16px;flex-wrap:wrap}
.cell{flex:1 1 320px;min-height:260px;border-radius:18px;display:flex;align-items:center;justify-content:space-around;padding:24px}
.light{background:#FBF8F1}.dark{background:#14131C}
.vfly{display:flex;align-items:center;justify-content:center}
.ffly{display:block;overflow:visible;width:190px;height:206px}
.fflamp,.ffhalo{transform-origin:60px 70px}
.mascot{width:128px;height:128px}
.mascot svg{width:100%;height:100%;display:block;filter:drop-shadow(0 10px 22px rgba(70,60,170,.20))}
@media (prefers-reduced-motion:no-preference){
  .fflamp,.ffhalo{animation:ffbreathe 2.8s ease-in-out infinite}
  .ffbody{animation:ffdrift 7s ease-in-out infinite}
  .mascot .jm{transform-box:view-box;transform-origin:60px 60px;animation:jmFloat 5.5s ease-in-out infinite}
  .mascot .jm-halo{transform-box:view-box;transform-origin:60px 70px;animation:ffbreathe 3.4s ease-in-out infinite}
}
${animCss()}
@keyframes ffbreathe{0%,100%{opacity:.62;transform:scale(.94)}50%{opacity:1;transform:scale(1.08)}}
@keyframes ffdrift{0%{transform:translate(0,0) rotate(0deg)}25%{transform:translate(13px,-11px) rotate(4deg)}50%{transform:translate(-6px,-19px) rotate(-3deg)}75%{transform:translate(-14px,-6px) rotate(3deg)}100%{transform:translate(0,0) rotate(0deg)}}
@keyframes jmFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
</style>
<h1>Lumi looks</h1><p>Left of each card: the firefly that flies over the home screen. Right: the mascot beside sign-in.</p>
${cards}`;
fs.writeFileSync(out, html);
console.log('Wrote ' + out);
