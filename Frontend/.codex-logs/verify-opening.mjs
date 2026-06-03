import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { setTimeout as wait } from "node:timers/promises";
import http from "node:http";
import path from "node:path";

const projectDir = "C:\\Users\\GIGABYTE\\Bureau\\pfa\\Frontend";
const runtimeModules =
  "C:\\Users\\GIGABYTE\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules";
const runtimeRequire = createRequire(`${runtimeModules}\\runtime.cjs`);
const { chromium } = runtimeRequire("playwright");
const port = 5183;
const url = `http://127.0.0.1:${port}`;
const browserPath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function waitForServer(targetUrl, timeoutMs = 30000) {
  const started = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(targetUrl, (response) => {
        response.resume();
        resolve();
      });

      request.on("error", () => {
        if (Date.now() - started > timeoutMs) {
          reject(new Error(`Timed out waiting for ${targetUrl}`));
          return;
        }

        setTimeout(attempt, 350);
      });
    };

    attempt();
  });
}

async function sampleCanvas(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector(".opening-scene-canvas");
    if (!canvas) return { found: false };

    const gl =
      canvas.getContext("webgl2", { preserveDrawingBuffer: true }) ||
      canvas.getContext("webgl", { preserveDrawingBuffer: true });

    if (!gl) {
      return {
        found: true,
        width: canvas.width,
        height: canvas.height,
        webgl: false,
      };
    }

    const points = [];
    const columns = 8;
    const rows = 6;
    let colored = 0;
    let alpha = 0;
    let hash = 0;
    const pixel = new Uint8Array(4);

    for (let xIndex = 1; xIndex < columns; xIndex += 1) {
      for (let yIndex = 1; yIndex < rows; yIndex += 1) {
        const x = Math.floor((canvas.width * xIndex) / columns);
        const y = Math.floor((canvas.height * yIndex) / rows);
        gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);

        const brightness = pixel[0] + pixel[1] + pixel[2];
        if (brightness > 36) colored += 1;
        if (pixel[3] > 8) alpha += 1;
        hash = (hash * 31 + pixel[0] * 3 + pixel[1] * 5 + pixel[2] * 7 + pixel[3]) >>> 0;
        points.push([pixel[0], pixel[1], pixel[2], pixel[3]]);
      }
    }

    const copy = document.querySelector(".opening-copy")?.getBoundingClientRect();
    const visual = document.querySelector(".opening-visual")?.getBoundingClientRect();
    const nav = document.querySelector(".opening-nav")?.getBoundingClientRect();
    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const overlap =
      copy && visual
        ? Math.max(0, Math.min(copy.right, visual.right) - Math.max(copy.left, visual.left)) *
          Math.max(0, Math.min(copy.bottom, visual.bottom) - Math.max(copy.top, visual.top))
        : 0;

    return {
      found: true,
      webgl: true,
      width: canvas.width,
      height: canvas.height,
      colored,
      alpha,
      hash,
      points,
      overlap,
      navBottom: nav?.bottom ?? 0,
      copyTop: copy?.top ?? 0,
      visualTop: visual?.top ?? 0,
      viewport,
    };
  });
}

const viteProcess = spawn(
  process.execPath,
  [
    path.join(projectDir, "node_modules", "vite", "bin", "vite.js"),
    "--host",
    "127.0.0.1",
    "--port",
    String(port),
    "--strictPort",
    "--force",
  ],
  {
    cwd: projectDir,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);

let viteOutput = "";
viteProcess.stdout.on("data", (chunk) => {
  viteOutput += chunk.toString();
});
viteProcess.stderr.on("data", (chunk) => {
  viteOutput += chunk.toString();
});

try {
  await waitForServer(url);

  const browser = await chromium.launch({
    executablePath: browserPath,
    headless: true,
  });
  const viewports = [
    { name: "desktop", width: 1440, height: 950 },
    { name: "mobile", width: 390, height: 844 },
  ];
  const results = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".opening-scene-canvas", { timeout: 10000 });
    await wait(500);

    const first = await sampleCanvas(page);
    await page.mouse.move(viewport.width * 0.72, viewport.height * 0.38);
    await wait(850);
    const second = await sampleCanvas(page);
    const screenshotPath = path.join(
      projectDir,
      ".codex-logs",
      `opening-${viewport.name}.png`,
    );
    await page.screenshot({ path: screenshotPath, fullPage: false });

    results.push({
      viewport: viewport.name,
      screenshot: screenshotPath,
      canvas: {
        width: second.width,
        height: second.height,
        coloredSamples: second.colored,
        alphaSamples: second.alpha,
        hashChanged: first.hash !== second.hash,
      },
      layout: {
        copyVisualOverlap: second.overlap,
        navBottom: second.navBottom,
        copyTop: second.copyTop,
        visualTop: second.visualTop,
      },
    });

    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify({ ok: true, url, results }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message, viteOutput }, null, 2));
  process.exitCode = 1;
} finally {
  viteProcess.kill();
}
