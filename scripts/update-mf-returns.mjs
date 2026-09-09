#!/usr/bin/env node
/**
 * scripts/update-mf-returns.mjs
 *
 * Pulls trailing 1Y/3Y/5Y returns for every scheme in
 * scripts/mf-schemes.json, using AMFI NAV history via the free
 * api.mfapi.in wrapper, and writes the result to src/data/mf-returns.json.
 *
 * No-fabrication rule, same as everywhere else in this project:
 * - If a scheme's AMFI code can't be confidently resolved (0 or 2+
 *   Direct-Growth matches), it's skipped and logged for manual review
 *   in scripts/mf-scheme-map-needs-review.json — never guessed.
 * - If NAV history doesn't reach far enough back for a period (fund
 *   too new), that period is left as null, same as the old hardcoded
 *   data did for "—" entries.
 *
 * Run manually:  node scripts/update-mf-returns.mjs
 * Run in CI:     .github/workflows/update-mf-returns.yml (weekly)
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCHEMES_PATH = path.join(__dirname, "mf-schemes.json");
const MAP_PATH = path.join(__dirname, "mf-scheme-map.json");
const REVIEW_PATH = path.join(__dirname, "mf-scheme-map-needs-review.json");
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "mf-returns.json");

const API_BASE = "https://api.mfapi.in/mf";

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch {
    return fallback;
  }
}

async function searchScheme(query) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return res.json();
}

async function fetchNavHistory(code) {
  const res = await fetch(`${API_BASE}/${code}`);
  if (!res.ok) return null;
  const json = await res.json();
  return (json.data || [])
    .map((d) => ({ date: parseDMY(d.date), nav: parseFloat(d.nav) }))
    .filter((d) => !Number.isNaN(d.nav) && !Number.isNaN(d.date.getTime()))
    .sort((a, b) => b.date - a.date); // newest first
}

function parseDMY(s) {
  const [d, m, y] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function navOnOrBefore(history, targetDate) {
  for (const point of history) {
    if (point.date <= targetDate) return point;
  }
  return null;
}

function yearsAgo(date, years) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() - years);
  return d;
}

// Known abbreviations that don't match AMFI's official scheme naming.
function normalizeForSearch(name) {
  return name
    .replace(/\bABSL\b/gi, "Aditya Birla Sun Life")
    .replace(/\bFoF\b/gi, "Fund of Fund")
    .replace(/\bPPFAS\b/gi, "Parag Parikh");
}

// A confident match must look like a Direct, Growth plan, NOT an
// IDCW/dividend/bonus variant, and NOT a segregated-portfolio or
// deactivated line (those track a different, non-standard NAV).
// If this can't be determined confidently, the caller skips the
// scheme rather than guessing.
function isConfidentMatch(candidateName) {
  const n = candidateName.toLowerCase();
  const isDirect = n.includes("direct");
  const isGrowth = n.includes("growth");
  const isNotIdcw = !n.includes("idcw") && !n.includes("dividend") && !n.includes("bonus");
  const isNotSegregated = !n.includes("segregated");
  const isNotDeactivated = !n.includes("deactivat");
  return isDirect && isGrowth && isNotIdcw && isNotSegregated && isNotDeactivated;
}

function computeReturns(history) {
  if (!history || history.length === 0) {
    return { r1y: null, r3y: null, r5y: null, asOf: null };
  }
  const latest = history[0];
  const p1 = navOnOrBefore(history, yearsAgo(latest.date, 1));
  const p3 = navOnOrBefore(history, yearsAgo(latest.date, 3));
  const p5 = navOnOrBefore(history, yearsAgo(latest.date, 5));

  const r1y = p1 ? (latest.nav / p1.nav - 1) * 100 : null;
  const r3y = p3 ? (Math.pow(latest.nav / p3.nav, 1 / 3) - 1) * 100 : null;
  const r5y = p5 ? (Math.pow(latest.nav / p5.nav, 1 / 5) - 1) * 100 : null;

  const round2 = (v) => (v === null ? null : Math.round(v * 100) / 100);

  return {
    r1y: round2(r1y),
    r3y: round2(r3y),
    r5y: round2(r5y),
    asOf: latest.date.toISOString().slice(0, 10),
  };
}

async function resolveCode(scheme, existingMap) {
  const cached = existingMap[scheme.scheme];
  if (cached?.code) return { code: cached.code };

  const normalizedScheme = normalizeForSearch(scheme.scheme);

  // Try the scheme name alone first. Most AMFI scheme names already
  // start with the AMC name, so prepending our own `provider` field
  // usually duplicates it and breaks the search API's matching.
  const soloResults = await searchScheme(normalizedScheme);
  const soloConfident = soloResults.filter(isConfidentMatch);

  if (soloConfident.length === 1) {
    return { code: soloConfident[0].schemeCode, matchedName: soloConfident[0].schemeName };
  }

  // If that was ambiguous or empty, retry with the normalized provider
  // prepended — helps when the scheme name alone is too generic
  // (e.g. "Regular Savings Fund" shared across AMCs).
  const combinedResults = await searchScheme(`${normalizeForSearch(scheme.provider)} ${normalizedScheme}`);
  const combinedConfident = combinedResults.filter(isConfidentMatch);

  if (combinedConfident.length === 1) {
    return { code: combinedConfident[0].schemeCode, matchedName: combinedConfident[0].schemeName };
  }

  // Still ambiguous or empty — don't guess, flag for manual review.
  const candidates = soloConfident.length ? soloConfident : combinedConfident;
  return { code: null, candidates: candidates.length ? candidates : soloResults.slice(0, 5) };
}

async function main() {
  const schemes = await readJson(SCHEMES_PATH, []);
  const existingMap = await readJson(MAP_PATH, {});
  const output = {};
  const needsReview = {};

  for (const scheme of schemes) {
    const resolved = await resolveCode(scheme, existingMap);

    if (!resolved.code) {
      needsReview[scheme.scheme] = resolved.candidates || [];
      console.warn(`Could not confidently resolve: ${scheme.scheme}`);
      continue;
    }

    existingMap[scheme.scheme] = {
      code: resolved.code,
      matchedName: resolved.matchedName ?? existingMap[scheme.scheme]?.matchedName,
    };

    const history = await fetchNavHistory(resolved.code);
    output[scheme.scheme] = computeReturns(history);

    // Be polite to the free API — small delay between requests.
    await new Promise((r) => setTimeout(r, 150));
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2));
  await fs.writeFile(MAP_PATH, JSON.stringify(existingMap, null, 2));

  if (Object.keys(needsReview).length > 0) {
    await fs.writeFile(REVIEW_PATH, JSON.stringify(needsReview, null, 2));
    console.warn(
      `\n${Object.keys(needsReview).length} scheme(s) need manual mapping.\n` +
      `See scripts/mf-scheme-map-needs-review.json for candidates, then add the\n` +
      `correct AMFI code to scripts/mf-scheme-map.json (as { "code": "..." }) and re-run.`
    );
  } else {
    await fs.rm(REVIEW_PATH, { force: true });
  }

  console.log(`Done. Wrote returns for ${Object.keys(output).length}/${schemes.length} schemes.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
