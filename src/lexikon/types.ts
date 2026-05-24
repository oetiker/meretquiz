// src/lexikon/types.ts
import type { Pantheon } from '../game/types';

export type LexikonCategory =
  | 'olymp'
  | 'helden'
  | 'monster'
  | 'titanen'
  | 'sonstige'
  | 'mythen';

export type FigureCategory = Exclude<LexikonCategory, 'mythen'>;

export type FigureKind =
  | 'gottheit'
  | 'held'
  | 'heldin'
  | 'monster'
  | 'titan'
  | 'nymphe'
  | 'sterblich';

export interface Figure {
  id: string;
  name: string;
  aliases: string[];
  category: FigureCategory;
  pantheon: Pantheon;
  kind: FigureKind;
  body: string;
}

export interface Story {
  id: string;
  title: string;
  body: string;
}

export type LexikonEntry =
  | { kind: 'figure'; data: Figure }
  | { kind: 'story';  data: Story };

export type EntryRef =
  | { kind: 'figure'; id: string }
  | { kind: 'story';  id: string };

export type BodySegment =
  | { kind: 'text'; value: string }
  | { kind: 'link'; target: EntryRef; label: string };
