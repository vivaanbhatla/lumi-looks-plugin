---
name: lumi-looks
description: Change how Lumi (also called Jugnu), the firefly tutor of samajh.me, is drawn. Ships three ready-made looks cut from artwork (glass, a lifelike glossy 3D firefly; buddy, a round smiling 3D firefly; professor, a cartoon firefly in a graduation cap) and a script that swaps them into the Samajh page and undoes them. Use when the user wants to change, reskin, restyle, preview or reset Lumi's or Jugnu's look, mascot, avatar or character in the samajh.me code, or to add a new look from an image.
---

# Lumi looks

Samajh (samajh.me) is one page whose firefly is drawn in code, not loaded from a file. There are
two drawings, both SVG strings in the page's script:

| Where it shows | In the code | Fixed by the site's CSS |
|---|---|---|
| The firefly flying over the home screen (`#jugnu`) | `function fireflySVG()` | viewBox `0 0 120 130`; `.ffbody` drifts; `.ffhalo` and `.fflamp` pulse around (60,70) |
| The mascot beside sign-in and on the review screens (`.mascot`) | `const JUGNU_MASCOT` | viewBox `0 0 120 120`; `.jm` hovers; `.jm-halo` pulses around (60,70) |

`scripts/apply-look.mjs` (next to this file; Node 18+, no dependencies) replaces both with a
picture from `looks/`, embedded as a `data:` URI because the page loads no outside images. It keeps
the original code inside a block marked `/* lumi-look:start … */` … `/* lumi-look:end */`, so
undoing restores the file byte for byte. Do not edit inside that block by hand.

## The looks
| id | What it is |
|---|---|
| `glass` | A glossy, lifelike 3D firefly in flight, seen from above. |
| `buddy` | A round, smiling 3D firefly facing you. The friendliest for young children. |
| `professor` | A flat cartoon firefly in a graduation cap and gown, holding a book and a pointer. |
| `original` | Samajh's own drawn firefly (this undoes a look). |

## Applying a look
1. Work in the samajh.me repository. If it is not in this session, say so and stop; do not edit a
   downloaded copy of the live site and call it done.
2. If the user did not name a look, build the preview and let them choose:
   `node <skill dir>/scripts/preview.mjs lumi-looks-preview.html`, then show or send that page.
3. Apply it from the repository root:
   `node <skill dir>/scripts/apply-look.mjs <look>`
   It finds the file that defines `fireflySVG()` / `JUGNU_MASCOT` on its own. Useful flags:
   `--site <dir>`, `--file <path>` (when several files match and only one is the source),
   `--dry-run`, `--status` (which look is on), `--list`.
4. If the page is generated from other source files, apply the look to the source, not the built
   output, and rebuild.
5. Check it: open the page, look at the sign-in mascot and the home-screen firefly, and confirm
   the browser console is clean. Run the repository's tests if it has any; a test that compares
   the mascot's markup will need its expectation updated, and say so rather than deleting it.
6. Tell the user what changed and that `apply-look.mjs original` undoes it. Commit or deploy only
   if they ask.

## What a look does and does not change
- Changes: the flying firefly and the mascot. The glow still breathes and the firefly still drifts
  and hovers, because the new drawing keeps the same class names.
- Wings no longer beat: a look is one picture, so there are no separate wings to move. Say this if
  the user asks about animation.
- Not changed: the favicon and the app mark (the glowing dot, `MARK`), the small dot avatar in
  Messages (`.fly`, `msgFly()`), and Lumi's name. Change those by hand only if asked.
- Each look adds roughly 40–55 KB to the page.

## Adding a look from a new image
1. Cut the character out onto a transparent background and save it as WebP, longest side 512 px,
   in `looks/<id>.webp`.
2. Add an entry to `looks/looks.json`: `id`, `name`, `description`, `file`, `width`, `height`, and
   `lamp` — the centre of the glowing lantern as fractions of the width and height (`x`, `y`) and
   its radius as a fraction of the width (`r`). The glow is drawn there.
3. Run `preview.mjs` and look at it on both backgrounds before applying.

## If the script cannot find the drawings
The site's code has changed. Search for `ffly`, `ffbody`, `jm-halo` or `Jugnu` to find the new
drawing code, keep the viewBox and class names from the table above, and use `flySVG()` and
`mascotSVG()` exported by `apply-look.mjs` to produce the markup.
