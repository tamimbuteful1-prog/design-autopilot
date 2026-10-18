import path from 'node:path';
import fs from 'node:fs';
import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition, ensureBrowser } from '@remotion/renderer';
import { config } from './config.mjs';

let bundleCache = null;

async function getBundle() {
  if (bundleCache) return bundleCache;
  bundleCache = await bundle({ entryPoint: path.join(config.root, 'src/remotion/index.ts'), onProgress: () => {} });
  return bundleCache;
}

const browserOpts = () => (config.browserExecutable ? { browserExecutable: config.browserExecutable } : {});

export async function prepareBrowser() {
  if (!config.browserExecutable) await ensureBrowser();
}

export async function getComposition(inputProps, id = 'DesignReel') {
  const serveUrl = await getBundle();
  const composition = await selectComposition({ serveUrl, id, inputProps, ...browserOpts() });
  return { serveUrl, composition };
}

/** Render silent H.264 video. Audio is muxed afterwards (see audio.mjs). */
export async function renderVideo(inputProps, outFile, onProgress, id = 'DesignReel') {
  const { serveUrl, composition } = await getComposition(inputProps, id);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  await renderMedia({
    serveUrl,
    composition,
    inputProps,
    codec: 'h264',
    crf: 12, // near-lossless intermediate; final encode happens in muxAudio()
    pixelFormat: 'yuv420p',
    muted: true,
    outputLocation: outFile,
    concurrency: Number(process.env.RENDER_CONCURRENCY || 2),
    timeoutInMilliseconds: 120000,
    onProgress: ({ progress }) => onProgress?.(progress),
    ...browserOpts(),
  });
  return { durationInFrames: composition.durationInFrames, fps: composition.fps };
}

export async function renderFrame(inputProps, frame, outFile, id = 'DesignReel') {
  const { serveUrl, composition } = await getComposition(inputProps, id);
  await renderStill({ serveUrl, composition, inputProps, frame, output: outFile, imageFormat: 'jpeg', jpegQuality: 88, ...browserOpts() });
  return outFile;
}
