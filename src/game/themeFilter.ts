import type { Question } from './types';
import type { ThemeFilter } from '../storage/schema';

export const allThemeFilters: ThemeFilter[] = [
  'alle',
  'olymp',
  'helden',
  'monster',
  'mythen',
  'griechisch',
  'roemisch',
];

export function filterByTheme(pool: Question[], filter: ThemeFilter): Question[] {
  if (filter === 'alle') return pool;
  return pool.filter(q => q.themes.includes(filter));
}

const LABELS: Record<ThemeFilter, string> = {
  alle: 'Alle',
  olymp: 'Olymp',
  helden: 'Held:innen',
  monster: 'Monster',
  mythen: 'Mythen',
  griechisch: 'Griechisch',
  roemisch: 'Römisch',
};

export function themeLabel(filter: ThemeFilter): string {
  return LABELS[filter];
}
