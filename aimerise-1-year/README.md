# Aimerise Marketing — "One Year. Thank you, everyone." (15s)

`out/aimerise-1-year.mp4` · 1920×1080 · 60 fps · H.264 + AAC · 15.0 s

The logo mark is rebuilt in code as the same line blend the brand uses, from a blue
triangle to a cyan rounded form (traced from `brand/aimerise-logo.png`). Because it is
live geometry, its 18 lines can flow as waves, fly through the camera, rise as a
column, and snap back into the exact mark. The wordmark copies the logo's treatment:
widely tracked caps with a white fill and grey outline, and MARKETING underneath.

## Script

| Time | Scene | Copy |
|---|---|---|
| 0–2.5 | Brand-gradient lines ripple across the dark, then twist and lock into the Aimerise mark. | ONE YEAR AGO, WE TOOK AIM. |
| 2.5–5 | The mark slides left, a giant outlined **1** draws itself and a day counter runs 001 → 365. The camera then flies through the mark's centre. | 1 YEAR *of aiming higher.* · DAY 365 / 365 |
| 5–10 | Gratitude: one line every two beats, with the key word in gradient italics. | *Thank you.* to every **client** who trusted us, every **partner** who built with us, every **teammate** who made it happen, and **everyone** who rose with us. |
| 10–12.5 | The lines turn vertical and rise, with sparks shooting up. | Year one was the *aim.* → *Now, we rise.* |
| 12.5–15 | The rising lines fold back into the mark, confetti bursts out on the downbeat and the wordmark settles with a light sweep. | CELEBRATING 1 YEAR · AIMERISE MARKETING · *Thank you, everyone.* · KOCHI · THRISSUR — AIMERISEMARKETING.COM |

**Palette:** navy `#040A18` · brand blue `#1A6DFF` · brand cyan `#1FE0CF` · white `#F4F7FF`
**Type:** Montserrat (wordmark and body) · Instrument Serif Italic (voice) · JetBrains Mono (labels)
**Sound:** an original score generated in code at 120 BPM (I–V–vi–IV): plucked arpeggio, bells on each thank-you line, a snare roll and riser into the lockup, then a crash.

## Rebuild

```bash
node soundtrack.mjs   # out/soundtrack.wav
node render.mjs       # out/aimerise-1-year.mp4
```
