import { describe, it, expect } from 'vitest';
import {
  filterByTheme,
  topicLabel,
  pantheonLabel,
  themeFilterSummary,
  allTopicTags,
  allPantheons,
} from '../../src/game/themeFilter';
import type { Question } from '../../src/game/types';
import type { ThemeFilter } from '../../src/storage/schema';

const sample: Question[] = [
  { id: '1', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', themes: ['olymp'], difficulty: 1, pantheon: 'griechisch' },
  { id: '2', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', themes: ['olymp'], difficulty: 1, pantheon: 'roemisch' },
  { id: '3', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', themes: ['helden'], difficulty: 2, pantheon: 'griechisch' },
  { id: '4', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', themes: ['monster'], difficulty: 1, pantheon: 'griechisch' },
  { id: '5', question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '', themes: ['olymp'], difficulty: 1, pantheon: 'beide' },
];

const f = (topics: ThemeFilter['topics'], pantheon: ThemeFilter['pantheon']): ThemeFilter => ({ topics, pantheon });

describe('filterByTheme', () => {
  it('returns all questions when filter has empty topics and pantheon=beide', () => {
    expect(filterByTheme(sample, f([], 'beide'))).toEqual(sample);
  });

  it('topic constraint: topics=[olymp] returns only olymp questions', () => {
    const r = filterByTheme(sample, f(['olymp'], 'beide'));
    expect(r.map(q => q.id).sort()).toEqual(['1', '2', '5']);
  });

  it('topic constraint: topics=[monster, mythen] returns questions matching either', () => {
    const r = filterByTheme(sample, f(['monster', 'mythen'], 'beide'));
    expect(r.map(q => q.id)).toEqual(['4']);
  });

  it('pantheon constraint: pantheon=griechisch returns greek + beide', () => {
    const r = filterByTheme(sample, f([], 'griechisch'));
    expect(r.map(q => q.id).sort()).toEqual(['1', '3', '4', '5']);
  });

  it('pantheon constraint: pantheon=roemisch returns roman + beide', () => {
    const r = filterByTheme(sample, f([], 'roemisch'));
    expect(r.map(q => q.id).sort()).toEqual(['2', '5']);
  });

  it('orthogonal intersection: olymp AND griechisch', () => {
    const r = filterByTheme(sample, f(['olymp'], 'griechisch'));
    expect(r.map(q => q.id).sort()).toEqual(['1', '5']);
  });

  it('orthogonal intersection: monster|mythen AND griechisch', () => {
    const r = filterByTheme(sample, f(['monster', 'mythen'], 'griechisch'));
    expect(r.map(q => q.id)).toEqual(['4']);
  });

  it('returns empty array when no questions match', () => {
    expect(filterByTheme([], f(['olymp'], 'beide'))).toEqual([]);
  });
});

describe('topicLabel', () => {
  it('returns German UI labels for each topic', () => {
    expect(topicLabel('olymp')).toBe('Olymp');
    expect(topicLabel('helden')).toBe('Held:innen');
    expect(topicLabel('monster')).toBe('Monster');
    expect(topicLabel('mythen')).toBe('Mythen');
  });
});

describe('pantheonLabel', () => {
  it('returns German UI labels for each pantheon', () => {
    expect(pantheonLabel('beide')).toBe('Beide');
    expect(pantheonLabel('griechisch')).toBe('Griechisch');
    expect(pantheonLabel('roemisch')).toBe('Römisch');
  });
});

describe('themeFilterSummary', () => {
  it('shows "Alle Themen" when no topics + beide', () => {
    expect(themeFilterSummary(f([], 'beide'))).toBe('Alle Themen');
  });

  it('shows pantheon when set', () => {
    expect(themeFilterSummary(f([], 'griechisch'))).toBe('Alle Themen · Griechisch');
  });

  it('shows topic list when set', () => {
    expect(themeFilterSummary(f(['olymp', 'helden'], 'beide'))).toBe('Olymp · Held:innen');
  });

  it('shows topics + pantheon when both set', () => {
    expect(themeFilterSummary(f(['monster'], 'roemisch'))).toBe('Monster · Römisch');
  });
});

describe('catalogs', () => {
  it('allTopicTags lists 4 topics', () => {
    expect(allTopicTags).toEqual(['olymp', 'helden', 'monster', 'mythen']);
  });

  it('allPantheons lists beide + griechisch + roemisch', () => {
    expect(allPantheons).toEqual(['beide', 'griechisch', 'roemisch']);
  });
});
