import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { figures } from '../../src/data/figures';
import { stories } from '../../src/data/stories';
import {
  getFigure,
  getStory,
  resolveByAlias,
  tokenizeBody,
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
  it('does NOT match the composite display name (design: alias-only lookup)', () => {
    // The 'name' field is for display; only entries in 'aliases' are matched.
    expect(resolveByAlias('Zeus / Jupiter')).toBeUndefined();
  });
});

describe('tokenizeBody', () => {
  it('returns single text segment for body without tokens', () => {
    const segs = tokenizeBody('Hallo Welt');
    expect(segs).toEqual([{ kind: 'text', value: 'Hallo Welt' }]);
  });

  it('parses a figure link [[zeus]] using figure name as label', () => {
    const segs = tokenizeBody('Mit [[zeus]] zusammen.');
    expect(segs).toEqual([
      { kind: 'text', value: 'Mit ' },
      { kind: 'link', target: { kind: 'figure', id: 'zeus' }, label: 'Zeus / Jupiter' },
      { kind: 'text', value: ' zusammen.' },
    ]);
  });

  it('parses a story link [[story:troja]] using story title as label', () => {
    const segs = tokenizeBody('siehe [[story:troja]].');
    expect(segs).toEqual([
      { kind: 'text', value: 'siehe ' },
      { kind: 'link', target: { kind: 'story', id: 'troja' }, label: 'Der Trojanische Krieg' },
      { kind: 'text', value: '.' },
    ]);
  });

  it('supports explicit label with pipe: [[zeus|Zeus]]', () => {
    const segs = tokenizeBody('Mit [[zeus|Zeus]].');
    expect(segs[1]).toEqual({
      kind: 'link',
      target: { kind: 'figure', id: 'zeus' },
      label: 'Zeus',
    });
  });

  it('supports explicit label for story', () => {
    const segs = tokenizeBody('im [[story:troja|Krieg um Troja]].');
    expect(segs[1].kind).toBe('link');
    if (segs[1].kind === 'link') {
      expect(segs[1].label).toBe('Krieg um Troja');
      expect(segs[1].target).toEqual({ kind: 'story', id: 'troja' });
    }
  });

  it('handles multiple links in one body', () => {
    const segs = tokenizeBody('[[zeus]] und [[story:troja]].');
    expect(segs.length).toBe(4);
    expect(segs[0]).toEqual({ kind: 'link', target: { kind: 'figure', id: 'zeus' }, label: 'Zeus / Jupiter' });
    expect(segs[1]).toEqual({ kind: 'text', value: ' und ' });
    expect(segs[2]).toEqual({ kind: 'link', target: { kind: 'story', id: 'troja' }, label: 'Der Trojanische Krieg' });
    expect(segs[3]).toEqual({ kind: 'text', value: '.' });
  });

  it('falls back to placeholder for unknown figure id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const segs = tokenizeBody('Mit [[ghost]].');
    expect(segs[1]).toEqual({ kind: 'text', value: '??:ghost' });
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('falls back to placeholder for unknown story id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const segs = tokenizeBody('Mit [[story:lost]].');
    expect(segs[1]).toEqual({ kind: 'text', value: '??:story:lost' });
    warn.mockRestore();
  });

  it('handles empty body', () => {
    expect(tokenizeBody('')).toEqual([]);
  });
});
