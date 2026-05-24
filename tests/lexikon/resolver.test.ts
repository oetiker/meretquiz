import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { figures } from '../../src/data/figures';
import { stories } from '../../src/data/stories';
import {
  getFigure,
  getStory,
  resolveByAlias,
} from '../../src/lexikon/resolver';
import type { Figure, Story } from '../../src/lexikon/types';

const fixtureFigure: Figure = {
  id: 'zeus',
  name: 'Zeus / Jupiter',
  aliases: ['Zeus', 'Jupiter'],
  category: 'olymp',
  pantheon: 'beide',
  kind: 'gottheit',
  body: 'Zeus ist der König der Götter.',
};
const fixtureStory: Story = {
  id: 'troja',
  title: 'Der Trojanische Krieg',
  body: '[[zeus|Zeus]] schickte ...',
};

beforeEach(() => {
  figures.push(fixtureFigure);
  stories.push(fixtureStory);
});
afterEach(() => {
  figures.length = 0;
  stories.length = 0;
});

describe('getFigure', () => {
  it('returns the figure for a known id', () => {
    expect(getFigure('zeus')).toEqual(fixtureFigure);
  });
  it('returns undefined for an unknown id', () => {
    expect(getFigure('nope')).toBeUndefined();
  });
});

describe('getStory', () => {
  it('returns the story for a known id', () => {
    expect(getStory('troja')).toEqual(fixtureStory);
  });
  it('returns undefined for an unknown id', () => {
    expect(getStory('nope')).toBeUndefined();
  });
});

describe('resolveByAlias', () => {
  it('finds figure by main name', () => {
    expect(resolveByAlias('Zeus')?.id).toBe('zeus');
  });
  it('finds figure by alias (Jupiter)', () => {
    expect(resolveByAlias('Jupiter')?.id).toBe('zeus');
  });
  it('is case-insensitive', () => {
    expect(resolveByAlias('JUPITER')?.id).toBe('zeus');
    expect(resolveByAlias('zeus')?.id).toBe('zeus');
  });
  it('returns undefined for unknown alias', () => {
    expect(resolveByAlias('Bananaman')).toBeUndefined();
  });
});
