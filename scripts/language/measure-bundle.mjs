// Measures the minified and gzipped size of the language code the app ships:
// compromise/two, syllable, and the syllable exceptions list.
// Run: npm run language:eval
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { build } from "vite";
import { ROOT } from "./sources.mjs";

const WORK = path.join(ROOT, "node_modules/.cache/wriceps-bundle");
const entries = {
  "compromise-two": `export { default } from "compromise/two";`,
  syllable: `export { syllable } from "syllable";`,
  "syllable-exceptions": `export { default } from ${JSON.stringify(path.join(ROOT, "lib/language/syllable-exceptions.json").replaceAll("\\", "/"))};`,
};

fs.mkdirSync(WORK, { recursive: true });
for (const [name, source] of Object.entries(entries)) {
  fs.writeFileSync(path.join(WORK, `${name}.js`), source + "\n");
  const outDir = path.join(WORK, "dist", name);
  await build({
    configFile: false,
    logLevel: "error",
    root: WORK,
    build: { lib: { entry: `${name}.js`, formats: ["es"], fileName: name }, outDir, emptyOutDir: true, minify: true },
  });
  let min = 0, gz = 0;
  for (const f of fs.readdirSync(outDir).filter((f) => /\.m?js$/.test(f))) {
    const buf = fs.readFileSync(path.join(outDir, f));
    min += buf.length;
    gz += zlib.gzipSync(buf).length;
  }
  console.log(`${name}: ${(min / 1024).toFixed(1)} KB minified, ${(gz / 1024).toFixed(1)} KB gzipped`);
}
