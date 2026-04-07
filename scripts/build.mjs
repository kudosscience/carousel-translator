import { build } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const target = ['chrome116'];

const entrypoints = [
  { infile: 'src/background/main.ts', outfile: 'dist/background.js', format: 'esm' },
  { infile: 'src/content/main.ts', outfile: 'dist/content.js', format: 'iife' },
  { infile: 'src/offscreen/main.ts', outfile: 'dist/offscreen.js', format: 'esm' },
  { infile: 'src/popup/main.ts', outfile: 'dist/popup.js', format: 'iife' },
  { infile: 'src/options/main.ts', outfile: 'dist/options.js', format: 'esm' }
];

const staticCopies = [
  ['manifest.json', 'manifest.json'],
  ['src/offscreen/offscreen.html', 'offscreen.html'],
  ['src/popup/popup.html', 'popup.html'],
  ['src/options/options.html', 'options.html']
];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await Promise.all(
  entrypoints.map((entry) =>
    build({
      entryPoints: [entry.infile],
      outfile: entry.outfile,
      bundle: true,
      format: entry.format,
      target,
      sourcemap: true,
      logLevel: 'info'
    })
  )
);

await Promise.all(
  staticCopies.map(([from, to]) => cp(path.join(rootDir, from), path.join(distDir, to)))
);
