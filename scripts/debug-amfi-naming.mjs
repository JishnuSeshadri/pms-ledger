#!/usr/bin/env node
/**
 * Temporary diagnostic — NOT part of the pipeline.
 * Dumps every AMFI schemeName whose lowercase form contains all of a
 * given set of loose keywords, for the 9 schemes that currently
 * resolve to zero matches in update-mf-returns.mjs. Unlike
 * findMatches() in that script, this does NOT require Direct/Growth/
 * full-token-set — the point is to see what AMFI actually calls these
 * funds, including near-misses, so the real matcher can be fixed.
 *
 * Run: node scripts/debug-amfi-naming.mjs
 */

const API_BASE = "https://api.mfapi.in/mf";

const TARGETS = [
  { label: "SBI Equity Hybrid Fund", keywords: ["sbi", "equity", "hybrid"] },
  { label: "ICICI Prudential Equity & Debt Fund", keywords: ["icici", "prudential", "equity", "debt"] },
  { label: "ABSL Equity Hybrid '95 Fund", keywords: ["birla", "equity", "hybrid"] },
  { label: "ABSL Regular Savings Fund", keywords: ["birla", "regular", "savings"] },
  { label: "ICICI Prudential Regular Savings Fund", keywords: ["icici", "prudential", "regular", "savings"] },
  { label: "Kotak Debt Hybrid Fund", keywords: ["kotak", "debt", "hybrid"] },
  { label: "DSP Regular Savings Fund", keywords: ["dsp", "regular", "savings"] },
  { label: "Tata Short Term Bond Fund", keywords: ["tata", "short", "term", "bond"] },
  { label: "Mirae Asset Short Duration Fund", keywords: ["mirae", "short", "duration"] },
];

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

async function main() {
  console.log("Downloading full scheme list from mfapi.in...");
  const allSchemes = await fetchAllSchemes();
  console.log(`Got ${allSchemes.length} schemes.\n`);

  for (const target of TARGETS) {
    console.log(`\n=== ${target.label} (keywords: ${target.keywords.join(", ")}) ===`);
    const hits = allSchemes.filter((s) => {
      const n = (s.schemeName || "").toLowerCase();
      return target.keywords.every((k) => n.includes(k));
    });
    if (hits.length === 0) {
      console.log("  (no schemeName contains ALL of these keywords)");
    } else {
      for (const h of hits) {
        console.log(`  [${h.schemeCode}] ${h.schemeName}`);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
