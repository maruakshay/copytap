import { build, context } from "esbuild";
import { cpSync, mkdirSync } from "node:fs";
import { execFileSync, spawn } from "node:child_process";

const watch = process.argv.includes("--watch");

const TW_IN = "src/options/options.css";
const TW_OUT = "dist/options/options.css";
// Windows resolves the npm bin shim as npx.cmd; mac/linux use npx.
const NPX = process.platform === "win32" ? "npx.cmd" : "npx";
const twArgs = ["@tailwindcss/cli", "-i", TW_IN, "-o", TW_OUT, "--minify"];

function buildCss() {
  execFileSync(NPX, twArgs, { stdio: "inherit", shell: process.platform === "win32" });
}

const opts = {
  entryPoints: {
    content: "src/content.ts",
    background: "src/background.ts",
    "options/options": "src/options/options.ts",
  },
  bundle: true,
  format: "esm",
  target: "chrome120",
  outdir: "dist",
  logLevel: "info",
};

mkdirSync("dist/options", { recursive: true });

function copyStatic() {
  cpSync("manifest.json", "dist/manifest.json");
  cpSync("logo.png", "dist/logo.png");
  cpSync("logo.png", "dist/options/logo.png");
  cpSync("src/options/options.html", "dist/options/options.html");
}

if (watch) {
  const ctx = await context(opts);
  await ctx.watch();
  copyStatic();
  spawn(NPX, [...twArgs, "--watch"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  console.log("watching...");
} else {
  await build(opts);
  copyStatic();
  buildCss();
  console.log("built -> dist/");
}
