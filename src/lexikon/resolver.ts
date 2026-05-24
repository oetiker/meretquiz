import { figures } from '../data/figures';
import { stories } from '../data/stories';
import type { Figure, Story } from './types';

export function getFigure(id: string): Figure | undefined {
  return figures.find(f => f.id === id);
}

export function getStory(id: string): Story | undefined {
  return stories.find(s => s.id === id);
}

export function resolveByAlias(name: string): Figure | undefined {
  const needle = name.toLowerCase();
  return figures.find(
    f => f.aliases.some(a => a.toLowerCase() === needle),
  );
}
