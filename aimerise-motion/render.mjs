// Frame-exact renderer: drives index.html in headless Chromium and pipes PNG
// frames into ffmpeg, then muxes the synthesized soundtrack.
//   node render.mjs                 -> out/aimerise-15s.mp4
//   node render.mjs --stills 1,3.2  -> out/still-<t>.png (quick look-dev)
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }

const dir = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(dir, 'out');
mkdirSync(outDir, { recursive: true });

const args = process.argv.slice(2);
const stillsArg = args.includes('--stills') ? args[args.indexOf('--stills') + 1] : null;
const exe = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;

const browser = await playwright.chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(pathToFileURL(path.join(dir, 'index.html')).href);
await page.evaluate(() => window.ready);

const grab = (frame, subs) => page.evaluate(([f, s]) => {
  window.renderFrame(f, s);
  return document.getElementById('c').toDataURL('image/png').split(',')[1];
}, [frame, subs]);

if (stillsArg) {
  const fs = await import('node:fs');
  for (const t of stillsArg.split(',').map(Number)) {
    const b64 = await grab(Math.round(t * 60), 4);
    fs.writeFileSync(path.join(outDir, `still-${t.toFixed(2)}.png`), Buffer.from(b64, 'base64'));
  }
  await browser.close();
  process.exit(0);
}

const frames = await page.evaluate(() => window.FRAMES);
const silent = path.join(outDir, 'video-silent.mp4');
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '60', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent],
  { stdio: ['pipe', 'inherit', 'inherit'] });

const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  const buf = Buffer.from(await grab(f, 4), 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 60 === 0) process.stdout.write(`\rframe ${f}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
await browser.close();
console.log('\nvideo done');

// mux soundtrack
const wav = path.join(outDir, 'soundtrack.wav');
const final = path.join(outDir, 'aimerise-15s.mp4');
if (existsSync(wav)) {
  await new Promise((res, rej) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, '-i', wav,
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', final], { stdio: 'inherit' })
    .on('close', c => (c === 0 ? res() : rej(new Error('mux ' + c)))));
  console.log('wrote', final);
}
