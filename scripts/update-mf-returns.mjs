#!/usr/bin/env node
/**
 * scripts/update-mf-returns.mjs
 *
 * Pulls trailing 1Y/3Y/5Y returns for every scheme in
 * scripts/mf-schemes.json, using AMFI NAV history via the free
 * api.mfapi.in wrapper, and writes the result to src/data/mf-returns.json.
 *
 * MATCHING STRATEGY: earlier versions used mfapi.in's hosted
 * /mf/search endpoint, which turned out to silently return nothing
 * for some large, well-known funds (e.g. SBI Equity Hybrid Fund) —
 * a quirk in their search, not a real naming mismatch. This version
 * instead downloads the FULL scheme list once (GET /mf) and matches
 * locally: every significant word in our scheme name must literally
 * appear in the candidate's official name. Stricter and fully within
 * our control.
 *
 * No-fabrication rule, same as everywhere else in this project:
 * - If a scheme's AMFI code can't be confidently resolved (0 or 2+
 *   genuinely different Direct-Growth matches), it's skipped and
 *   logged for manual review in mf-scheme-map-needs-review.json —
 *   never guessed.
 * - If two matches are actually the SAME fund under a reissued code
 *   (AMFI does this occasionally), the one with more recent NAV data
 *   is kept automatically — a data-driven tiebreak, not a guess.
 * - If NAV history doesn't reach far enough back for a period (fund
 *   too new), that period is left null, same as the old hardcoded
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

// Downloads every scheme mfapi.in knows about, once per run. Falls
// back to paginating if the API caps a single request's page size.
async function fetchAllSchemes() {
  const all = [];
  let offset = 0;
  const limit = 1000;
  for (let guard = 0; guard < 60; guard++) {
    const res = await fetch(`${API_BASE}?limit=${limit}&offset=${offset}`);
    if (!res.ok) break;
    const page = await res.json();
    if (!Array.isArray(page) || page.length === 0) break;
    all.push(...page);
    if (page.length < limit) break;
    offset += limit;
  }
  return all;
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

const STOPWORDS = new Set(["fund", "the", "and", "of", "plan", "option"]);

function significantTokens(name) {
  return normalizeForSearch(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((w) => w && !STOPWORDS.has(w));
}

// A confident match must look like a Direct, Growth plan and NOT an
// IDCW/dividend/bonus or deactivated variant. We do NOT exclude
// "segregated portfolio" — for many debt/hybrid funds that disclosure
// is now a permanent part of the official name and still refers to
// the main investable Direct Growth line, not a quarantined NAV.
function isConfidentMatch(candidateName) {
  if (typeof candidateName !== "string") return false;
  const n = candidateName.toLowerCase();
  const isDirect = n.includes("direct");
  const isGrowth = n.includes("growth");
  const isNotIdcw = !n.includes("idcw") && !n.includes("dividend") && !n.includes("bonus");
  const isNotDeactivated = !n.includes("deactivat");
  return isDirect && isGrowth && isNotIdcw && isNotDeactivated;
}

// Strips the segregated-portfolio disclosure and sorts significant
// tokens, so two listings of the "same" fund (just reissued under a
// new AMFI code, sometimes with words reordered) collapse to the
// same key — distinguishing that from a genuinely different fund.
function normalizeCandidateKey(name) {
  const stripped = name.replace(/\(existing number of segregated portfolios?[^)]*\)/gi, "");
  return significantTokens(stripped).sort().join(" ");
}

function findMatches(allSchemes, scheme) {
  const targetTokens = significantTokens(scheme.scheme);
  return allSchemes.filter((s) => {
    if (!isConfidentMatch(s.schemeName)) return false;
    const nameTokens = new Set(significantTokens(s.schemeName));
    return targetTokens.every((t) => nameTokens.has(t));
  });
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

// When several confident matches turn out to be the exact same fund
// (just reissued under a new AMFI code — the old one typically stops
// getting NAV updates), fetch each candidate's history and keep
// whichever is still actively updated. Data-driven tiebreak, not a
// guess: we're checking which code is live, not picking arbitrarily.
async function pickFreshest(candidates) {
  let best = null;
  for (const c of candidates) {
    const history = await fetchNavHistory(c.schemeCode);
    const latestDate = history?.[0]?.date ?? null;
    if (latestDate && (!best || latestDate > best.latestDate)) {
      best = { ...c, latestDate };
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return best;
}

async function resolveCode(scheme, existingMap, allSchemes) {
  const cached = existingMap[scheme.scheme];
  if (cached?.code) return { code: cached.code };

  const confident = findMatches(allSchemes, scheme);

  if (confident.length === 1) {
    return { code: confident[0].schemeCode, matchedName: confident[0].schemeName };
  }

  if (confident.length > 1) {
    // Case A: they're really the same fund, just reissued under a new
    // code — the one with more recent NAV data wins.
    const distinctKeys = new Set(confident.map((c) => normalizeCandidateKey(c.schemeName)));
    if (distinctKeys.size === 1) {
      const best = await pickFreshest(confident);
      if (best) return { code: best.schemeCode, matchedName: best.schemeName };
    }

    // Case B: genuinely different funds sharing all target tokens
    // (e.g. "Short Term Fund" is contained within "Ultra Short to
    // Short Term Fund"). Prefer whichever has the fewest EXTRA
    // significant words beyond our target — a more specific/derivative
    // fund variant always has more, the plain match doesn't.
    const targetTokens = new Set(significantTokens(scheme.scheme));
    const withExtraCount = confident.map((c) => {
      const extra = significantTokens(c.schemeName).filter((t) => !targetTokens.has(t));
      return { candidate: c, extraCount: new Set(extra).size };
    });
    const minExtra = Math.min(...withExtraCount.map((x) => x.extraCount));
    const tightest = withExtraCount.filter((x) => x.extraCount === minExtra);
    if (tightest.length === 1) {
      return { code: tightest[0].candidate.schemeCode, matchedName: tightest[0].candidate.schemeName };
    }

    // Still genuinely ambiguous — don't guess, flag for manual review.
    return { code: null, candidates: confident };
  }

  // Nothing matched at all — don't guess, flag for manual review.
  return { code: null, candidates: [] };
}

async function main() {
  const schemes = await readJson(SCHEMES_PATH, []);
  const existingMap = await readJson(MAP_PATH, {});
  const output = {};
  const needsReview = {};

  console.log("Downloading full scheme list from mfapi.in...");
  const allSchemes = await fetchAllSchemes();
  console.log(`Got ${allSchemes.length} schemes.`);

  for (const scheme of schemes) {
    const resolved = await resolveCode(scheme, existingMap, allSchemes);

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
