// scripts/apply-question-tags.ts
// Reads a TSV file from /tmp/curated-tags.txt (one line per question:
//   <q-id>\t<comma-separated-figureIds>\t<optional storyId>
// and mutates src/data/questions.ts by inserting `figureIds` and
// optional `storyId` fields immediately before each question's closing brace.
//
// Run: pnpm tsx scripts/apply-question-tags.ts <path-to-tags-tsv>
import { readFileSync, writeFileSync } from 'node:fs';

const tagsPath = process.argv[2] ?? '/tmp/curated-tags.txt';
const tsv = readFileSync(tagsPath, 'utf-8');
const questionsPath = 'src/data/questions.ts';
const src = readFileSync(questionsPath, 'utf-8');

const tags = new Map<string, { figureIds: string[]; storyId?: string }>();
for (const line of tsv.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [id, figs, story] = trimmed.split('\t');
  if (!id) continue;
  const figureIds = figs && figs.length > 0 ? figs.split(',').filter(x => x.length > 0) : [];
  const storyId = story && story.length > 0 ? story : undefined;
  tags.set(id, { figureIds, storyId });
}

console.error(`Loaded ${tags.size} curated tag rows.`);

// State machine: walk the source looking for `id: 'q-...',` markers.
// For each matched question, find the matching closing `},` at the same
// indentation level and insert the new fields before it.

const lines = src.split('\n');
const out: string[] = [];
let i = 0;
let touched = 0;
let untouchedIds: string[] = [];
const seenIds = new Set<string>();

while (i < lines.length) {
  const line = lines[i];
  const idMatch = line.match(/^(\s*)id:\s*'([^']+)',\s*$/);
  if (!idMatch) {
    out.push(line);
    i++;
    continue;
  }
  const [, indent, id] = idMatch;
  if (!id.startsWith('q-')) {
    out.push(line);
    i++;
    continue;
  }
  // Find the closing `};` or `},` at same indent (object close at outer level
  // is `  },` — the question objects sit inside the questions array literal).
  // We search forward for a line `^${indent.slice(0, indent.length - 2)}},?$`
  // (one indent level less than the id line).
  const objCloseIndent = indent.slice(0, Math.max(0, indent.length - 2));
  const closeRe = new RegExp(`^${objCloseIndent}\\},?\\s*$`);
  let closeIdx = -1;
  for (let j = i + 1; j < lines.length; j++) {
    if (closeRe.test(lines[j])) {
      closeIdx = j;
      break;
    }
  }
  if (closeIdx === -1) {
    // Shouldn't happen for a well-formed file; pass through unchanged.
    out.push(line);
    i++;
    continue;
  }

  seenIds.add(id);
  const tagInfo = tags.get(id);
  if (!tagInfo) {
    untouchedIds.push(id);
    // Copy lines as-is up to and including the closing brace.
    for (let k = i; k <= closeIdx; k++) out.push(lines[k]);
    i = closeIdx + 1;
    continue;
  }

  // Copy the question body up to (but not including) the closing brace.
  for (let k = i; k < closeIdx; k++) out.push(lines[k]);

  // Insert the new fields. Use the same indent as the id line (which is the
  // field indent inside the object).
  const figIds = tagInfo.figureIds;
  const storyId = tagInfo.storyId;
  if (figIds.length > 0) {
    out.push(`${indent}figureIds: [${figIds.map(f => `'${f}'`).join(', ')}],`);
  }
  if (storyId) {
    out.push(`${indent}storyId: '${storyId}',`);
  }

  // Closing brace.
  out.push(lines[closeIdx]);

  i = closeIdx + 1;
  touched++;
}

writeFileSync(questionsPath, out.join('\n'));
console.error(`Modified ${touched} questions.`);
if (untouchedIds.length > 0) {
  console.error(`Untouched (no curated tag): ${untouchedIds.length}`);
  if (untouchedIds.length <= 20) {
    console.error('IDs:', untouchedIds.join(', '));
  }
}
// Sanity: tags that didn't match any question
for (const id of tags.keys()) {
  if (!seenIds.has(id)) {
    console.error(`WARN: curated tag for unknown question id: ${id}`);
  }
}
