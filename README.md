# lumi-looks (Claude Code plugin)

Changes how Lumi (Jugnu), the firefly tutor of [samajh.me](https://samajh.me), looks. It can add a
card to Settings where each student chooses their firefly and the colour of its light, or apply
one fixed look for everyone. Either is undone with one command.

![The looks](preview.png)

- Skill `lumi-looks`: how Lumi is drawn in the Samajh page, the looks, and the scripts that apply, preview and undo them.
- Command `/lumi-customizer [remove | status]` adds or removes the Settings card.
- Command `/lumi-look <professor | glass | original | preview>` applies one fixed look.

## Install

At the prompt of a Claude Code session:

```
/plugin install lumi-looks --marketplace vivaanbhatla/lumi-looks-plugin
```

To try it from a local folder instead:

```bash
claude --plugin-dir /path/to/lumi-looks-plugin
```

## Use

In a Claude Code session opened on the samajh.me repository:

```
/lumi-customizer
/lumi-look preview
/lumi-look original
```

Or run the scripts yourself from the repository root (Node 18+, no dependencies):

```bash
node /path/to/lumi-looks-plugin/skills/lumi-looks/scripts/install-customizer.mjs
```

```bash
node /path/to/lumi-looks-plugin/skills/lumi-looks/scripts/apply-look.mjs professor
```

## The customizer

Settings gets a "Lumi's look" card with four choices (Classic, Auto, Graduate, Glossy) and seven
light colours (yellow, orange, pink, green, blue, purple, white). Everyone starts with Classic,
the firefly Samajh draws today, so nothing looks different until a student chooses. Auto picks by
age: Classic up to 10, Graduate from 11 to 17, Glossy for 18 and over. The light starts yellow.
The choice is saved on the device with the theme. The page grows by about 102 KB.

## The two new looks

| Look | id | What it is | What moves |
|---|---|---|---|
| Graduate | `professor` | A picture of a cartoon firefly in cap and gown, with a book and a pointer | wings beat, tassel swings |
| Glossy | `glass` | A flat cartoon drawing, seen from above | wings beat, feelers and wing covers twitch |

Both also lean into each leg of the flight around the home screen. The Graduate picture is cut
into layers (wings, body, and the tassel on top) so its wings can move; the layers are in
`skills/lumi-looks/looks`, and how everything moves is in `skills/lumi-looks/customizer/anim.css`.

## What changes

The firefly that flies over the home screen and the mascot beside sign-in. The firefly is drawn
under the page, so the words and the question box stay on top of it; today it flies in front of
them. The favicon, the dot avatar in Messages and Lumi's name are left alone. The firefly still appears on the home screen
only, and nothing moves when the device asks for reduced motion.
