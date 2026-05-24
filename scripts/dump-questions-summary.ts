// scripts/dump-questions-summary.ts
// Dumps a compact one-line summary of each question for curation.
import { questions } from '../src/data/questions';

for (const q of questions) {
  // Format: id | question | correct-option | other-options... | explanation
  const correct = q.options[q.correctIndex];
  const wrongs = q.options.filter((_, i) => i !== q.correctIndex).join('|');
  const expl = q.explanation.replace(/\s+/g, ' ').slice(0, 200);
  console.log(`${q.id}\t${q.question}\t✓${correct}\t${wrongs}\t${expl}`);
}
