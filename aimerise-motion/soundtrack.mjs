// Procedural 15s soundtrack, 120 BPM, locked to the same beat grid as the
// visuals. Writes out/soundtrack.wav (44.1kHz, 16-bit stereo).
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SR = 44100, DUR = 15, N = SR * DUR;
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 1;
const noise = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2147483648 - 1; };
const add = (i, v, pan = 0) => { if (i >= 0 && i < N) { L[i] += v * (1 - pan) ; R[i] += v * (1 + pan); } };

// sidechain pump: ducks pad + bass after each kick
const kicks = [];
for (let t = 2.0; t < 11.5; t += 0.5) kicks.push(t);
for (let t = 11.5; t < 13.0; t += 0.5) kicks.push(t);
kicks.push(13.5);
function duck(t) {
  let last = -10; for (const k of kicks) if (k <= t) last = k;
  return 1 - 0.75 * Math.exp(-(t - last) * 9);
}

function kick(t0, amp = 1) {
  let ph = 0;
  for (let n = 0; n < SR * 0.5; n++) {
    const t = n / SR, f = 44 + 120 * Math.exp(-t * 32);
    ph += 2 * Math.PI * f / SR;
    const v = Math.tanh(Math.sin(ph) * 2.2) * Math.exp(-t * 6.5) * amp + noise() * Math.exp(-t * 400) * 0.25 * amp;
    add(Math.floor(t0 * SR) + n, v * 0.9);
  }
}
function hat(t0, amp = 0.12, pan = 0.2) {
  let prev = 0;
  for (let n = 0; n < SR * 0.08; n++) {
    const t = n / SR, x = noise(), hp = x - prev; prev = x;
    add(Math.floor(t0 * SR) + n, hp * Math.exp(-t * 70) * amp, pan);
  }
}
function clap(t0, amp = 0.5) {
  let lp = 0;
  for (let n = 0; n < SR * 0.25; n++) {
    const t = n / SR, x = noise(); lp += (x - lp) * 0.35;
    const burst = t < 0.03 ? (Math.floor(t * 300) % 3 === 0 ? 1 : 0.4) : 1;
    add(Math.floor(t0 * SR) + n, ((x - lp) * Math.exp(-t * 16) * burst + Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 30) * 0.6) * amp);
  }
}
function blip(t0, f = 1400, amp = 0.12, dur = 0.07, pan = 0) {
  for (let n = 0; n < SR * dur; n++) { const t = n / SR; add(Math.floor(t0 * SR) + n, Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 50) * amp, pan); }
}
function boom(t0, amp = 1, len = 2) {
  let lp = 0;
  for (let n = 0; n < SR * len; n++) {
    const t = n / SR, x = noise(); lp += (x - lp) * 0.04;
    add(Math.floor(t0 * SR) + n, (Math.sin(2 * Math.PI * (36 + 30 * Math.exp(-t * 8)) * t) * Math.exp(-t * 2.2) + lp * 2.5 * Math.exp(-t * 3)) * amp);
  }
}
// reverse-swell whoosh that slams into a cut at tEnd
function whoosh(tEnd, len = 0.55, amp = 0.35) {
  let lp = 0, lp2 = 0;
  for (let n = 0; n < SR * len; n++) {
    const t = n / SR, k = t / len, x = noise();
    const c = 0.01 + 0.25 * k * k; lp += (x - lp) * c; lp2 += (x - lp2) * c * 0.5;
    add(Math.floor((tEnd - len) * SR) + n, (lp - lp2) * k * k * amp * 3, Math.sin(k * 6) * 0.5);
  }
}
function riser(t0, t1, amp = 0.18) {
  let ph = 0;
  for (let n = 0; n < SR * (t1 - t0); n++) {
    const k = n / (SR * (t1 - t0)), f = 180 * Math.pow(8, k);
    ph += 2 * Math.PI * f / SR;
    add(Math.floor(t0 * SR) + n, (Math.sin(ph) * 0.6 + noise() * 0.4 * k) * k * k * amp);
  }
}

// harmony: one chord per bar (2s)
const CH = { Am: [220, 261.63, 329.63], F: [174.61, 220, 261.63], C: [196, 261.63, 329.63], G: [196, 246.94, 293.66] };
const ROOT = { Am: 55, F: 43.65, C: 65.41, G: 49 };
const BARS = ['Am', 'Am', 'F', 'C', 'G', 'Am', 'F', 'Am'];
const chordAt = t => BARS[Math.min(BARS.length - 1, Math.floor(t / 2))];

// pad (detuned saws through a one-pole low-pass that opens over time) + sub bass
{
  const ph = new Float64Array(12); let lpL = 0, lpR = 0, bph = 0;
  for (let n = 0; n < N; n++) {
    const t = n / SR, ch = CH[chordAt(t)];
    let sL = 0, sR = 0;
    ch.forEach((f, j) => {
      for (let d = 0; d < 2; d++) {
        const idx = j * 2 + d, fr = f * (d ? 1.006 : 0.994);
        ph[idx] = (ph[idx] + fr / SR) % 1;
        const saw = ph[idx] * 2 - 1;
        if (d) sR += saw; else sL += saw;
      }
    });
    const open = t < 13.5 ? 0.01 + 0.05 * Math.min(1, t / 13) : 0.08 * Math.exp(-(t - 13.5) * 1.2) + 0.01;
    lpL += (sL - lpL) * open; lpR += (sR - lpR) * open;
    let g = 0.07 * duck(t) * Math.min(1, t / 0.8);
    if (t > 13.0 && t < 13.5) g *= 0.35;                       // tension dip before the drop
    if (t >= 13.5) g = 0.11 * Math.exp(-(t - 13.5) * 0.9);      // lockup tail
    L[n] += lpL * g; R[n] += lpR * g;
    // bass on 8ths from the first beat until the drop
    if (t >= 2.0 && t < 13.0) {
      const f = ROOT[chordAt(t)] * ((Math.floor(t * 4) % 4 === 3) ? 2 : 1);
      bph += 2 * Math.PI * f / SR;
      const env = Math.exp(-((t * 4) % 1) * 2.5);
      const v = Math.tanh(Math.sin(bph) * 1.8) * 0.28 * env * duck(t);
      L[n] += v; R[n] += v;
    }
  }
}

// ---- arrangement ----
for (let t = 0.0; t < 2.0; t += 0.125) hat(t, 0.05, 0.6);             // scanning ticks
blip(1.0, 2200, 0.25, 0.12); boom(1.0, 0.45, 1.2);                     // target lock
whoosh(2.0, 0.4, 0.5);
kicks.forEach(k => kick(k, k === 13.5 ? 1.25 : 1));
for (let t = 4.25; t < 11.5; t += 0.5) hat(t, 0.14, 0.25);
for (let t = 6.5; t < 11.5; t += 0.25) if ((t * 4) % 2 === 1) hat(t, 0.07, -0.35);
[4.0, 6.5, 9.0].forEach(t => whoosh(t, 0.5, 0.4));
[5.0, 7.0, 8.0, 10.0, 11.0].forEach(t => clap(t, 0.32));
for (let i = 0; i < 5; i++) blip(9.95 + i * 0.13, 900 + i * 220, 0.1, 0.09, i % 2 ? 0.5 : -0.5); // map arrivals
for (let i = 0; i < 6; i++) clap(11.5 + i * 0.25, 0.45 + i * 0.04);   // word slams
riser(12.8, 13.5, 0.22);
whoosh(13.5, 0.7, 0.55);
boom(13.5, 1.0, 1.5);
blip(14.1, 1760, 0.12, 0.2); blip(14.18, 2637, 0.08, 0.25);           // logo sparkle

// master: soft clip, normalize, fade the last 60ms
let peak = 0;
for (let n = 0; n < N; n++) { L[n] = Math.tanh(L[n] * 1.1); R[n] = Math.tanh(R[n] * 1.1); peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n])); }
const gain = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  const f = Math.min(1, (N - n) / (SR * 0.06));
  buf.writeInt16LE(Math.round(L[n] * gain * f * 32767), 44 + n * 4);
  buf.writeInt16LE(Math.round(R[n] * gain * f * 32767), 46 + n * 4);
}
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out');
mkdirSync(dir, { recursive: true });
writeFileSync(path.join(dir, 'soundtrack.wav'), buf);
console.log('wrote soundtrack.wav, peak', peak.toFixed(2));
