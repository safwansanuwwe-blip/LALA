# Aimerise Marketing — One Year (vertical, Liquid Glass)

`out/aimerise-1-year-vertical.mp4` (dark) · `out/aimerise-1-year-vertical-white.mp4` (white) · 1080×1920 (9:16) · 60 fps · H.264 + AAC · 15.0 s
Made for Reels, Shorts, TikTok and Stories.

## The Liquid Glass motion language

This piece borrows Apple's Liquid Glass design language. It isn't an installable
library, so the effect is built directly in `index.html`. Each frame renders in two layers:

- **Back:** the navy backdrop with drifting blue and cyan orbs, the brand lines and the wordmark.
- **Front:** glass panels and type. Every glass panel:
  - shows a *magnified, frosted* copy of the back layer (refraction and blur)
  - bends light harder toward its rim through graded lensing rings, so lines behind it curve at the edge
  - has a top sheen, a soft inner glow and a cyan caustic gliding along the lower rim
  - carries a specular edge light keyed from the top-left, plus a floating shadow
- **Motion:** shapes run on damped springs (about 17% overshoot, then they settle). Pills grow
  out of round droplets, the thank-you card re-forms to fit each line, and a clear glass
  lens glides across the wordmark at the end, magnifying it.

## Script

| Time | Scene |
|---|---|
| 0–2.5 | Brand-gradient lines flow in and lock into the Aimerise mark. Glass pill: ONE YEAR AGO, WE TOOK AIM. |
| 2.5–5 | The mark rises and a glass card springs up: **1** · YEAR *of aiming higher.* · DAY 001 → 365. The camera then flies through the mark. |
| 5–10 | *Thank you.* A liquid glass card re-forms around each line: to every **client** who trusted us · every **partner** who built with us · every **teammate** who made it happen · and **everyone** who rose with us. |
| 10–12.5 | Rising lines. Glass pill: Year one was the *aim.* → *Now, we rise.* |
| 12.5–15 | Lockup with confetti: CELEBRATING 1 YEAR pill · mark · AIMERISE MARKETING (glass lens sweep) · *Thank you, everyone.* · AIMERISEMARKETING.COM pill |

## Rebuild

```bash
node soundtrack.mjs   # out/soundtrack.wav
node render.mjs           # dark  → out/aimerise-1-year-vertical.mp4
node render.mjs --light   # white → out/aimerise-1-year-vertical-white.mp4
```

The white theme is the same piece with swapped theme tokens (`T` in `index.html`): a soft
white backdrop with pastel brand orbs, frosted white glass with a hairline edge, navy
type, and the outlined wordmark exactly as it appears on the white logo.

```bash
# preview either theme live: open index.html (dark) or index.html?light (white)
```
