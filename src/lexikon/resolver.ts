import { figures } from '../data/figures';
import { stories } from '../data/stories';
import type { Figure, Story, BodySegment } from './types';

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

const TOKEN_RE = /\[\[([^\]]+)\]\]/g;

export function tokenizeBody(body: string): BodySegment[] {
  if (body.length === 0) return [];
  const segments: BodySegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: 'text', value: body.slice(lastIndex, match.index) });
    }
    segments.push(parseToken(match[1]));
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < body.length) {
    segments.push({ kind: 'text', value: body.slice(lastIndex) });
  }
  return segments;
}

function parseToken(raw: string): BodySegment {
  const [refPart, labelPart] = raw.split('|', 2);
  let target: { kind: 'figure' | 'story'; id: string };
  if (refPart.startsWith('story:')) {
    target = { kind: 'story', id: refPart.slice('story:'.length) };
  } else {
    target = { kind: 'figure', id: refPart };
  }
  const lookup =
    target.kind === 'figure' ? getFigure(target.id) : getStory(target.id);
  if (!lookup) {
    console.warn(`[lexikon] unknown ref in body: ${raw}`);
    return { kind: 'text', value: `??:${raw}` };
  }
  const defaultLabel = target.kind === 'figure'
    ? (lookup as Figure).name
    : (lookup as Story).title;
  return {
    kind: 'link',
    target,
    label: labelPart ?? defaultLabel,
  };
}
