#!/usr/bin/env node
// Data-freshness check for the trackers (used by .github/workflows/data-freshness.yml).
// Lists rows with `verified: true` whose `last_checked` (YYYY-MM-DD) is older than N days,
// or missing/invalid. Deterministic: reads local JSON only, no network.
//
// Usage: node scripts/check-freshness.mjs [--days 30] [--today YYYY-MM-DD] [--out report.md]
// Writes a Markdown report to --out (default: stdout). If GITHUB_OUTPUT is set, appends
// `stale_count=<n>`. Always exits 0 on a successful check; 1 only on a broken data file.
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const MAX_AGE_DAYS = Number(opt('days', '30'));
const todayStr = opt('today', new Date().toISOString().slice(0, 10));
const outPath = opt('out', null);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DAY = 86_400_000;
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const toUtc = (s) => (ISO.test(s) ? Date.parse(`${s}T00:00:00Z`) : NaN);
const today = toUtc(todayStr);
if (!Number.isFinite(today) || !Number.isFinite(MAX_AGE_DAYS)) {
  console.error('Bad --today or --days');
  process.exit(1);
}

// One entry per tracker; `label` turns a row into a human-readable name.
const DATASETS = [
  { file: 'src/data/visa-tracker.json', label: (r) => `${r.destination} (${r.passport_type}, ${r.purpose})` },
  { file: 'src/data/routes_tracker.json', label: (r) => `${r.airline}: ${r.origin?.iata}–${r.destination?.iata} (${r.status})` },
  { file: 'src/data/established_routes.json', label: (r) => `${r.airline}: ${r.origin_iata}–${r.destination_iata}` },
];
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');

const stale = [];
const summary = [];
for (const ds of DATASETS) {
  let rows;
  try {
    rows = JSON.parse(readFileSync(join(ROOT, ds.file), 'utf8'));
  } catch (e) {
    console.error(`Cannot read ${ds.file}: ${e.message}`);
    process.exit(1);
  }
  if (!Array.isArray(rows)) {
    console.error(`${ds.file}: expected a JSON array`);
    process.exit(1);
  }
  const verified = rows.filter((r) => r.verified === true);
  let n = 0;
  for (const r of verified) {
    const t = toUtc(r.last_checked);
    const age = Number.isFinite(t) ? Math.floor((today - t) / DAY) : null;
    if (age === null || age > MAX_AGE_DAYS) {
      n++;
      stale.push({ file: ds.file, id: r.id, label: ds.label(r), last: r.last_checked ?? '(missing)', age });
    }
  }
  summary.push(`| \`${ds.file}\` | ${rows.length} | ${verified.length} | ${n} |`);
}
stale.sort((a, b) => (b.age ?? Infinity) - (a.age ?? Infinity) || a.file.localeCompare(b.file) || String(a.id).localeCompare(String(b.id)));

const lines = [
  `Verified rows whose \`last_checked\` is more than ${MAX_AGE_DAYS} days before ${todayStr} (UTC), or missing.`,
  '',
  '| File | Rows | Verified | Stale |',
  '|---|---:|---:|---:|',
  ...summary,
  '',
];
if (stale.length) {
  lines.push('| File | id | Row | last_checked | Age (days) |', '|---|---|---|---|---:|');
  for (const s of stale) lines.push(`| \`${s.file}\` | \`${esc(s.id)}\` | ${esc(s.label)} | ${esc(s.last)} | ${s.age ?? 'n/a'} |`);
  lines.push('', 'Re-check each row against its cited sources, then update `last_checked` (and the data) in the JSON file.');
} else {
  lines.push('No stale verified rows.');
}
const report = lines.join('\n') + '\n';
if (outPath) writeFileSync(outPath, report);
else process.stdout.write(report);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `stale_count=${stale.length}\n`);
console.error(`stale_count=${stale.length}`);
