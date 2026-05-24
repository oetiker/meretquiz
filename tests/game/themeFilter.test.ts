import { describe, it, expect } from 'vitest';
import { filterByTheme, themeLabel, allThemeFilters } from '../../src/game/themeFilter';
import type { Question } from '../../src/game/types';

const sample: Question[] = [
  { id: '1', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', themes: ['olymp', 'griechisch'], difficulty: 1, pantheon: 'griechisch' },
  { id: '2', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', themes: ['olymp', 'roemisch'], difficulty: 1, pantheon: 'roemisch' },
  { id: '3', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', themes: ['helden', 'griechisch'], difficulty: 2, pantheon: 'griechisch' },
  { id: '4', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', themes: ['monster', 'griechisch'], difficulty: 1, pantheon: 'griechisch' },
];

describe('filterByTheme', () => {
  it('returns all questions when filter is "alle"', () => {
    expect(filterByTheme(sample, 'alle')).toEqual(sample);
  });

  it('filters by single tag — "olymp" returns only olymp questions', () => {
    const r = filterByTheme(sample, 'olymp');
    expect(r.map(q => q.id)).toEqual(['1', '2']);
  });

  it('filters by pantheon tag — "roemisch" returns only roman pantheon', () => {
    const r = filterByTheme(sample, 'roemisch');
    expect(r.map(q => q.id)).toEqual(['2']);
  });

  it('returns empty array when no questions match', () => {
    expect(filterByTheme([], 'olymp')).toEqual([]);
  });
});

describe('themeLabel', () => {
  it('returns German UI label for each filter', () => {
    expect(themeLabel('alle')).toBe('Alle');
    expect(themeLabel('olymp')).toBe('Olymp');
    expect(themeLabel('helden')).toBe('Held:innen');
    expect(themeLabel('monster')).toBe('Monster');
    expect(themeLabel('mythen')).toBe('Mythen');
    expect(themeLabel('griechisch')).toBe('Griechisch');
    expect(themeLabel('roemisch')).toBe('Römisch');
  });
});

describe('allThemeFilters', () => {
  it('lists all filters with "alle" first', () => {
    expect(allThemeFilters[0]).toBe('alle');
    expect(allThemeFilters).toContain('olymp');
    expect(allThemeFilters).toContain('helden');
    expect(allThemeFilters).toContain('monster');
    expect(allThemeFilters).toContain('mythen');
    expect(allThemeFilters).toContain('griechisch');
    expect(allThemeFilters).toContain('roemisch');
    expect(allThemeFilters.length).toBe(7);
  });
});
