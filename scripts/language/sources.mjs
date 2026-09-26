// Downloads the pinned CMU and SCOWL sources into a git-ignored cache folder.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const ROOT = path.resolve(import.meta.dirname, "../..");
const CACHE = path.join(ROOT, "node_modules/.cache/wriceps-data");

// Pinned so the generated word list is reproducible.
const CMU_URL =
  "https://raw.githubusercontent.com/cmusphinx/cmudict/74790861f652b15e4ac49015a90074ad62a27690/cmudict.dict";
const SCOWL_VERSION = "2020.12.07";
const SCOWL_URL = `https://downloads.sourceforge.net/wordlist/scowl-${SCOWL_VERSION}.tar.gz`;

async function download(url, file) {
  if (fs.existsSync(file)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

export async function getSources() {
  fs.mkdirSync(CACHE, { recursive: true });
  const cmuFile = path.join(CACHE, "cmudict.dict");
  await download(CMU_URL, cmuFile);

  const scowlFinal = path.join(CACHE, `scowl-${SCOWL_VERSION}`, "final");
  if (!fs.existsSync(path.join(scowlFinal, "english-words.60"))) {
    const archive = `scowl-${SCOWL_VERSION}.tar.gz`;
    await download(SCOWL_URL, path.join(CACHE, archive));
    // Only the word lists; the rest of the archive has symlinks Windows tar can't create.
    const result = spawnSync("tar", ["-xzf", archive, `scowl-${SCOWL_VERSION}/final`], {
      cwd: CACHE,
      stdio: "inherit",
    });
    if (result.status !== 0) throw new Error("Could not unpack SCOWL with tar.");
  }
  return { cmuFile, scowlFinal };
}

// CMU: word -> Set of syllable counts (vowel sounds carry a stress digit 0/1/2).
export function readCmu(cmuFile) {
  const cmu = new Map();
  for (const line of fs.readFileSync(cmuFile, "utf8").split("\n")) {
    const m = line.match(/^([a-z']+)(?:\(\d+\))?\s+([^#]+)/);
    if (!m) continue;
    const phones = m[2].trim();
    const n = (phones.match(/[012]/g) ?? []).length;
    const counts = cmu.get(m[1]) ?? new Set();
    counts.add(n);
    // -ire words: CMU writes "ire" as AY + ER, so also accept the one-vowel form.
    if (/ire/.test(m[1]) && /AY\d ER\d/.test(phones)) counts.add(n - 1);
    cmu.set(m[1], counts);
  }
  return cmu;
}

export function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}
