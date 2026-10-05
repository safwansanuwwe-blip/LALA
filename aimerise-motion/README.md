# Aimerise Marketing — 15s motion piece

`out/aimerise-15s.mp4` · 1920×1080 · 60 fps · H.264 + AAC · 15.0 s

Code-driven motion graphics: every frame is a pure function of time, rendered in
headless Chromium with 4-sample motion blur. The soundtrack is generated in code
on the same 120 BPM grid, so every cut, slam and counter lands on a beat.

## Script & storyboard

| Time | Beat | On screen | Copy |
|---|---|---|---|
| 0.0–2.0 | **AIM** | A reticle hunts across a HUD grid and locks on with a hard snap. | `SCANNING THE MARKET…` → `● TARGET LOCKED: GROWTH` |
| 2.0–4.0 | **RISE** | The dot launches upward (whip-pan) and draws a glowing growth chart. **RISE** rises up letter by letter, **AIM** slides in, and an orange **E** drops between them: AIM·E·RISE. | `SOFTWARE × MARKETING — ONE GROWTH ENGINE` |
| 4.0–6.5 | **Two engines** | Split screen: a code editor builds itself next to rising performance bars. | *Software that builds.* × *Marketing that performs.* |
| 6.5–9.0 | **Proof** | Diagonal orange wipe, the counter ticks up, and a paper wipe brings in an orbit of brands. | **20,000+** active customers · **1,000+** companies, freelancers & enterprises trust us. |
| 9.0–11.5 | **Reach** | Iris opens from Kochi; arcs fly out to Tamil Nadu, Karnataka, Hyderabad, Mumbai, Delhi. | *Rooted in Kerala. Growing across India.* |
| 11.5–13.5 | **The shift** | Kinetic type on 8th notes, then the orange field collapses into a single dot. | NOW · *entering* · THE · DIGITAL · *marketing* · ERA. |
| 13.5–15.0 | **Lockup** | The dot becomes the logo mark (reticle + rising arrow); the wordmark keeps the orange "e". | **aimerise** MARKETING · *Aim higher. Rise faster.* · aimerisemarketing.com · A venture by Auraphile Digital |

Brand facts are from Aimerise's public About page: a venture by Auraphile Digital, offices in
Kochi & Thrissur, 20,000+ active customers, 1,000+ companies, entering the digital
marketing era. The tagline and all other lines were written for this piece.

**Palette:** ink `#07070C` · paper `#F3EFE6` · signal orange `#FF4D1A` · violet `#7B5CFF`
**Type:** Space Grotesk (display) · Instrument Serif Italic (voice) · JetBrains Mono (HUD)

## Rebuild

```bash
node soundtrack.mjs          # out/soundtrack.wav
node render.mjs              # out/aimerise-15s.mp4 (needs ffmpeg + playwright/chromium)
node render.mjs --stills 3.5,14.9   # quick look-dev frames
```

Open `index.html` in a browser for a live, looping real-time preview.
