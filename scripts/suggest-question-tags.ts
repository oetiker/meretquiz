// scripts/suggest-question-tags.ts
// Run: pnpm tsx scripts/suggest-question-tags.ts > /tmp/suggested-tags.txt
// Output: TSV per question: id\tfigureIds-comma-separated
import { questions } from '../src/data/questions';
import { figures } from '../src/data/figures';

function escape(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function suggestForText(text: string): string[] {
  const hits = new Set<string>();
  for (const fig of figures) {
    for (const alias of fig.aliases) {
      const re = new RegExp(`\\b${escape(alias)}\\b`, 'i');
      if (re.test(text)) {
        hits.add(fig.id);
        break;
      }
    }
  }
  return [...hits];
}

for (const q of questions) {
  const combined = q.question + ' ' + q.options.join(' ') + ' ' + q.explanation;
  const ids = suggestForText(combined);
  console.log(`${q.id}\t${ids.join(',')}`);
}
