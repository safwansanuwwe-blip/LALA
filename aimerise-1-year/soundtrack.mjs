// Warm, celebratory 15s score at 120 BPM (I–V–vi–IV), locked to the visuals.
// Writes out/soundtrack.wav (44.1kHz, 16-bit stereo).
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SR = 44100, DUR = 15, N = SR * DUR;
const Lb = new Float32Array(N), Rb = new Float32Array(N);
let seed = 7;
const noise = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2147483648 - 1; };
const add = (i, v, pan = 0) => { if (i >= 0 && i < N) { Lb[i] += v * (1 - pan); Rb[i] += v * (1 + pan); } };
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

// chords as MIDI notes; sections follow the scenes
const CH = { C: [60, 64, 67, 72], G: [55, 59, 62, 67], Am: [57, 60, 64, 69], F: [53, 57, 60, 65] };
const ROOT = { C: 36, G: 31, Am: 33, F: 29 };
const SECTIONS = [[0, 'C'], [2.5, 'G'], [5, 'Am'], [6.5, 'F'], [8, 'C'], [9, 'G'], [10, 'Am'], [11.25, 'F'], [12.5, 'C']];
const chordAt = t => { let c = 'C'; for (const [s, n] of SECTIONS) if (t >= s) c = n; return c; };

const kicks = [];
for (let t = 5.0; t < 12.0; t += 0.5) kicks.push(t);
kicks.push(12.5);
const duck = t => { let last = -10; for (const k of kicks) if (k <= t) last = k; return 1 - 0.55 * Math.exp(-(t - last) * 8); };

function kick(t0, amp = 0.8) {
  let ph = 0;
  for (let n = 0; n < SR * 0.45; n++) {
    const t = n / SR, f = 46 + 90 * Math.exp(-t * 28); ph += 2 * Math.PI * f / SR;
    add(Math.floor(t0 * SR) + n, Math.tanh(Math.sin(ph) * 1.6) * Math.exp(-t * 7) * amp);
  }
}
function clap(t0, amp = 0.28) {
  let lp = 0;
  for (let n = 0; n < SR * 0.3; n++) {
    const t = n / SR, x = noise(); lp += (x - lp) * 0.3;
    const burst = t < 0.025 ? (Math.floor(t * 320) % 3 === 0 ? 1 : 0.35) : 1;
    add(Math.floor(t0 * SR) + n, (x - lp) * Math.exp(-t * 14) * burst * amp, 0.1);
  }
}
function hat(t0, amp = 0.08, pan = 0.3) {
  let prev = 0;
  for (let n = 0; n < SR * 0.06; n++) { const t = n / SR, x = noise(), hp = x - prev; prev = x; add(Math.floor(t0 * SR) + n, hp * Math.exp(-t * 80) * amp, pan); }
}
function pluck(t0, f, amp, pan) {
  for (let n = 0; n < SR * 0.5; n++) {
    const t = n / SR, e = Math.exp(-t * 9);
    add(Math.floor(t0 * SR) + n, (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 20)) * e * amp, pan);
  }
}
function bell(t0, f, amp = 0.15, pan = 0) {
  const parts = [[1, 1], [2.76, 0.45], [5.4, 0.25], [8.9, 0.12]];
  for (let n = 0; n < SR * 2.2; n++) {
    const t = n / SR; let v = 0;
    for (const [r, a] of parts) v += Math.sin(2 * Math.PI * f * r * t) * a * Math.exp(-t * (1.6 + r * 0.6));
    add(Math.floor(t0 * SR) + n, v * amp, pan);
  }
}
function whoosh(tEnd, len = 0.5, amp = 0.3) {
  let lp = 0, lp2 = 0;
  for (let n = 0; n < SR * len; n++) {
    const t = n / SR, k = t / len, x = noise(), c = 0.01 + 0.22 * k * k;
    lp += (x - lp) * c; lp2 += (x - lp2) * c * 0.5;
    add(Math.floor((tEnd - len) * SR) + n, (lp - lp2) * k * k * amp * 3, Math.sin(k * 5) * 0.5);
  }
}
function crash(t0, amp = 0.22) {
  let prev = 0;
  for (let n = 0; n < SR * 2.5; n++) { const t = n / SR, x = noise(), hp = x - prev; prev = x; add(Math.floor(t0 * SR) + n, hp * Math.exp(-t * 1.8) * amp, Math.sin(t * 3) * 0.3); }
}
function boom(t0, amp = 0.8) {
  for (let n = 0; n < SR * 1.6; n++) { const t = n / SR; add(Math.floor(t0 * SR) + n, Math.sin(2 * Math.PI * (38 + 26 * Math.exp(-t * 7)) * t) * Math.exp(-t * 2.4) * amp); }
}
function riser(t0, t1, amp = 0.14) {
  let ph = 0;
  for (let n = 0; n < SR * (t1 - t0); n++) {
    const k = n / (SR * (t1 - t0)); ph += 2 * Math.PI * 220 * Math.pow(6, k) / SR;
    add(Math.floor(t0 * SR) + n, (Math.sin(ph) * 0.5 + noise() * 0.5 * k) * k * k * amp);
  }
}

// pad + bass
{
  const ph = new Float64Array(8); let lpL = 0, lpR = 0, bph = 0;
  for (let n = 0; n < N; n++) {
    const t = n / SR, ch = CH[chordAt(t)];
    let sL = 0, sR = 0;
    for (let j = 0; j < 4; j++) for (let d = 0; d < 2; d++) {
      const idx = j * 2 + d; ph[idx] = (ph[idx] + hz(ch[j] - 12) * (d ? 1.005 : 0.995) / SR) % 1;
      const saw = ph[idx] * 2 - 1; if (d) sR += saw; else sL += saw;
    }
    const open = t < 12.5 ? 0.012 + 0.05 * Math.min(1, t / 12) : 0.07 * Math.exp(-(t - 12.5) * 0.8) + 0.012;
    lpL += (sL - lpL) * open; lpR += (sR - lpR) * open;
    let g = 0.055 * duck(t) * Math.min(1, t / 0.6);
    if (t >= 12.5) g = 0.085 * Math.exp(-(t - 12.5) * 0.55);
    Lb[n] += lpL * g; Rb[n] += lpR * g;
    if (t >= 5.0 && t < 12.0) {
      const f = hz(ROOT[chordAt(t)]); bph += 2 * Math.PI * f / SR;
      const v = Math.tanh(Math.sin(bph) * 1.5) * 0.22 * Math.exp(-((t * 2) % 1) * 1.5) * duck(t);
      Lb[n] += v; Rb[n] += v;
    }
  }
}

// ---- arrangement ----
// arpeggio on 16ths, swelling in; pauses for the drop
for (let s = 0; s < 12.5 / 0.125; s++) {
  const t = s * 0.125; if (t > 11.9 && t < 12.5) continue;
  const ch = CH[chordAt(t)], note = ch[[0, 1, 2, 3, 2, 1, 3, 2][s % 8]] + 12;
  const amp = 0.035 + 0.05 * Math.min(1, t / 6);
  pluck(t, hz(note), amp, s % 2 ? 0.45 : -0.45);
}
bell(2.0, hz(84), 0.12, -0.2); bell(2.05, hz(91), 0.07, 0.3);          // mark locks in
whoosh(5.0, 0.55, 0.4); boom(5.0, 0.4);                                 // zoom-through
kicks.forEach(k => kick(k, k === 12.5 ? 1.1 : 0.75));
for (let t = 6.0; t < 12.0; t += 1.0) clap(t, 0.26);
for (let t = 7.25; t < 12.0; t += 0.5) hat(t, 0.08, 0.3);
for (let i = 0; i < 4; i++) bell(6.0 + i, hz([76, 79, 81, 84][i]), 0.05, i % 2 ? 0.4 : -0.4); // each thank-you line
// snare roll into the lockup
for (let t = 11.5, step = 0.125; t < 12.45; t += step, step = Math.max(0.04, step * 0.86)) clap(t, 0.12 + (t - 11.5) * 0.25);
riser(11.4, 12.5, 0.16);
whoosh(12.5, 0.6, 0.45);
boom(12.5, 0.9); crash(12.5, 0.2);
bell(12.5, hz(72), 0.14); bell(12.62, hz(79), 0.1, 0.3); bell(12.74, hz(84), 0.09, -0.3); bell(13.4, hz(88), 0.06, 0.2);

// master
let peak = 0;
for (let n = 0; n < N; n++) { Lb[n] = Math.tanh(Lb[n] * 1.1); Rb[n] = Math.tanh(Rb[n] * 1.1); peak = Math.max(peak, Math.abs(Lb[n]), Math.abs(Rb[n])); }
const gain = 0.89 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  const f = Math.min(1, (N - n) / (SR * 0.4));
  buf.writeInt16LE(Math.round(Lb[n] * gain * f * 32767), 44 + n * 4);
  buf.writeInt16LE(Math.round(Rb[n] * gain * f * 32767), 46 + n * 4);
}
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'out');
mkdirSync(dir, { recursive: true });
writeFileSync(path.join(dir, 'soundtrack.wav'), buf);
console.log('wrote soundtrack.wav, peak', peak.toFixed(2));
