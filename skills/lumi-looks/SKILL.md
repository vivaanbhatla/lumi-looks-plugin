---
name: lumi-looks
description: Change how Lumi (also called Jugnu), the firefly tutor of samajh.me, is drawn. Ships two animated looks with no faces (Graduate, a picture cut into layers so its wings beat; Glossy, a flat cartoon drawing) and two scripts: one installs a Settings card where each student can swap the classic firefly for another and choose the colour of its light; the other applies one fixed look for everyone. Use when the user wants to add, change or remove the firefly customizer, or to change, reskin, animate, preview or reset Lumi's or Jugnu's look, mascot, avatar, glow or light colour in the samajh.me code, or to add or redraw a look.
---

# Lumi looks

Samajh (samajh.me) is one page whose firefly is drawn in code, not loaded from a file. There are
two drawings, both SVG strings in the page's script:

| Where it shows | In the code | Fixed by the site's CSS |
|---|---|---|
| The firefly flying over the home screen (`#jugnu`) | `function fireflySVG()` | viewBox `0 0 120 130`; `.ffbody` drifts; `.ffhalo` and `.fflamp` pulse around (60,70); on a desktop `.vfly` flies a 46-second path (`ffroam`) |
| The mascot beside sign-in and on the review screens (`.mascot`) | `const JUGNU_MASCOT` | viewBox `0 0 120 120`; `.jm` hovers; `.jm-halo` pulses around (60,70) |

The page loads no outside images, so everything a look needs is put inside the page.

## Two ways to change Lumi
| | Customizer | Fixed look |
|---|---|---|
| What the student gets | A card in Settings: choose the firefly and the colour of its light | Nothing to choose; everyone sees the one look |
| Script | `scripts/install-customizer.mjs` | `scripts/apply-look.mjs <look>` |
| Undo | `install-customizer.mjs --remove` | `apply-look.mjs original` |

Use the customizer unless the user asks for one look for everyone. The two do not combine: the
customizer refuses to install over a fixed look, so run `apply-look.mjs original` first. Both
scripts need Node 18+ and nothing else, find the file that defines `fireflySVG()` /
`JUGNU_MASCOT` on their own, and restore the file byte for byte when undone.

## The looks
`looks/looks.json` lists them. The user chose each one; do not swap the artwork without being
asked.

| Look | id | What it is | What moves |
|---|---|---|---|
| Graduate | `professor` | The user's picture of a cartoon firefly in cap and gown, with a book and a pointer | wings beat, tassel swings |
| Glossy | `glass` | A flat cartoon drawing, seen from above with its wing covers open | wings beat, feelers and wing covers twitch |

`original` is Samajh's own drawn firefly. As a fixed look it undoes one; in the customizer it is
the Classic choice, which is the default. It has a face.

There was a third look, Buddy (the user's picture of a round 3D firefly). The user had it
removed; do not bring it back unless asked.

What the user asked for, to keep when changing or adding a look: no faces (no eyes, no mouth);
new drawings flat, not realistic or glossy; and every look animated for flying around the page.

A look is one of two kinds:
- A picture in layers (Graduate): WebP files listed back to front in `layers`, each with
  its place in the picture (`x`, `y`, `w`, `h` in the picture's pixels). Wings come first, then
  `base` (everything that does not move), then what sits on top. A layer that moves has `class`,
  `origin` (the joint it turns about, as a share of its own box) and, for a wing, `vars`. Put back
  together at rest, the layers are exactly the picture. Each wing layer carries a little invented
  wing under where the body covers it, so no gap opens when it swings. A layer with light in it
  has a `mask`: the same size, white where the layer is light.
- A drawing (Glossy): one SVG file, `"vector": true`, its moving parts in groups with the motion
  classes.

## The customizer
```
node <skill dir>/scripts/install-customizer.mjs
```
Run it from the samajh.me repository root. Flags: `--site <dir>`, `--file <path>`, `--dry-run`,
`--status`, `--remove`.

It adds the code in `customizer/runtime.js`, with the artwork from `looks/` and the styles in
`customizer/anim.css`, and connects it in six places. Each edit is wrapped as
`/*lumi-c[*/new/*lumi-c|old]lumi-c*/`, which is how `--remove` restores the file; do not edit
inside those markers by hand. To change the feature, change `customizer/runtime.js` or
`customizer/anim.css` and run the installer again.

What it does in the page:
- Two new settings in `S.set`, listed in `SET_KEYS` so they load and save with the theme:
  `lumi` (`classic`, `auto`, `professor`, `glass`) and `lumiGlow` (`yellow`, `orange`,
  `pink`, `green`, `blue`, `purple`, `white`). Defaults: `classic` and `yellow`.
- Everyone starts with Classic, the firefly Samajh draws today; the user chose that over starting
  by age. So after installing, nothing looks different until a student picks another firefly. To
  change the default, change `lumi:'classic'` in `install-customizer.mjs`, the fallback in
  `lumiLook()` and the order of `LUMI_LOOKS` (the default is listed first).
- `auto` is a choice in the picker, not the default. It follows `S.set.profile.age` through
  `LUMI_BY_AGE`: `11-13` and `14-17` are Graduate (`professor`), `18+` is Glossy (`glass`). An age
  that is not in the table (`u8`, `8-10`) or no profile at all (signed out) keeps Classic. Change
  the ages in that one table.
- `fireflySVG()` and the mascot (`lumiMascot()`, which replaces each `'+JUGNU_MASCOT+'`) draw the
  chosen look. The site's own drawing is the Classic look, moving as the site already moves it.
- `lumiCard()` is the Settings card, placed after "The look". `lumiSync()`, called from
  `flyPlace()`, redraws the flying firefly when the choice or the age band changes.
- The light. A drawing's light is three colours (`#F5C542` the light, `#FFF6D2` its pale centre,
  `#D99A1E` its deep edge) that are swapped for the chosen ones. A picture layer with a mask gets
  a recoloured copy of itself shown through the mask. To add a colour, add a row to `LUMI_GLOWS`
  and its id to the `lumiGlow` list in `install-customizer.mjs`.
- Layering. The site draws the firefly above the whole page (`#jugnu` at z-index 2, over `.shell`
  at 1). The user asked that it never cover the words, so `customizer/anim.css` puts it at
  z-index 0: it shows over the paper, and text, the question box and everything else on the page
  are drawn on top of it. This applies to every look, Classic included, and to a fixed look too.
  The rule is written `#jugnu#jugnu` because the site's stylesheet is in the body and would
  otherwise win. Where the firefly rests is unchanged, so words can still sit over it; over the
  dark Graduate, grey text is harder to read.
- Size. The lantern sits on (60,70), where the site pulses the glow, and the firefly rises no
  higher than 16 from the top of its box, so that a tall one stays inside a short window at the
  top-left turn of its flight. Do not loosen that without testing a window about 650 px high.

After installing: open the page and confirm the sign-in mascot and the home-screen firefly are
still the classic one, and that the firefly passes behind the title and the question box; then in Settings choose each firefly and a light, look at the home screen,
reload and confirm the choices stayed, and confirm the console is clean. The page grows by about 102 KB. The choice is saved per device, not per student profile.

## How the looks move
`customizer/anim.css` holds it all (and the layering rule above). A moving part is a group (in a drawing) or a layer (in a
picture) with a class and a `transform-origin`, the joint it turns about, given as a share of
that part's own box:

| Class | What it does | Used for |
|---|---|---|
| `lw` | beats: fast while flying (`.vfly`), faster while listening or talking, slower while thinking; a slow sway beside a form (`.mascot`) | wings |
| `lwp` | with `lw`, a slower beat for the bigger wings of a picture | the Graduate's wings |
| `lsway` | swings side to side | the Graduate's tassel |
| `ltw` | twitches | feelers; Glossy's wing covers |
| `lwave`, `lspark` | waves; glows brighter and dimmer | spare, for new drawings |
| `llean` | tips the whole firefly into each leg of the flight around the home screen | added by the code around every look |

A wing says how far it swings and how it flattens with `--r0`, `--r1` (the two ends of the beat),
`--sx` and `--sy` (its size at the far end), in `vars` for a layer or in the group's `style`.

The flight around the page itself is the site's own (`ffroam` on a desktop; on a phone the firefly
hovers in the middle). `llean` keeps time with it, which is why `lumiSync()` restarts the flight
when it redraws the firefly. Nothing moves in the Settings thumbnails, and nothing moves at all
under `prefers-reduced-motion`. The firefly is on the home screen only; that is the site's choice.

A CSS transform replaces an element's `transform` attribute, so a part that is both placed with
`transform="rotate(…)"` and animated must have the class on a wrapping `<g>`, not on itself.

## Applying a fixed look
1. Work in the samajh.me repository. If it is not in this session, say so and stop; do not edit a
   downloaded copy of the live site and call it done.
2. If the user did not name a look, build the preview and let them choose:
   `node <skill dir>/scripts/preview.mjs lumi-looks-preview.html`, then show or send that page.
3. Apply it from the repository root: `node <skill dir>/scripts/apply-look.mjs <look id>`.
   Useful flags: `--site <dir>`, `--file <path>` (when several files match and only one is the
   source), `--dry-run`, `--status` (which look is on), `--list`.
4. If the page is generated from other source files, apply the look to the source, not the built
   output, and rebuild.
5. Check it: open the page, look at the sign-in mascot and the home-screen firefly, and confirm
   the browser console is clean. Run the repository's tests if it has any; a test that compares
   the mascot's markup will need its expectation updated, and say so rather than deleting it.
6. Tell the user what changed and that `apply-look.mjs original` undoes it. Commit or deploy only
   if they ask.

The fixed look keeps the original code inside a block marked `/* lumi-look:start … */` …
`/* lumi-look:end */`. Do not edit inside that block by hand.

## What neither way changes
The favicon and the app mark (the glowing dot, `MARK`), the small dot avatar in Messages (`.fly`,
`msgFly()`), and Lumi's name. Change those by hand only if asked.

## Adding or changing a look
Every entry in `looks/looks.json` needs `id`, `name`, `description`, `width`, `height` and `lamp`:
the centre of the lantern as fractions of the width and height (`x`, `y`) and its radius as a
fraction of the width (`r`).

A drawing (small, recolours exactly, moves easily):
1. Save it as `looks/<id>.svg`, a complete SVG whose `viewBox` starts at `0 0` and is the
   drawing's real extent. Use the three light colours above for everything that should take the
   chosen light. Put the motion classes on wrapping groups.
2. In its entry give `file` and `"vector": true`; `width` and `height` are the viewBox.

A picture:
1. Cut the character out onto a transparent background, longest side 512 px.
2. To have it move, cut it into layers as described under "The looks" and list them in `layers`.
   Check that the layers laid over one another are the picture again, and look at each wing at
   both ends of its beat for gaps along the body.
3. A picture that does not need to move can be one file: give `file` (and `mask`) in place of
   `layers`. It will still drift, lean and glow.

The picker's two new looks are `professor` and `glass`; the installer stops if one is missing.
Another look for the picker also needs its id in `LUMI_LOOKS`, in `LUMI_BY_AGE` if Auto should
give it to an age, and in the `lumi` list in `install-customizer.mjs`. Run `preview.mjs`
and look at both backgrounds before installing.

## If a script cannot find the drawings
The site's code has changed. Search for `ffly`, `ffbody`, `jm-halo` or `Jugnu` to find the new
drawing code, keep the viewBox and class names from the first table, and use `flySVG()` and
`mascotSVG()` exported by `apply-look.mjs` to produce the markup.
