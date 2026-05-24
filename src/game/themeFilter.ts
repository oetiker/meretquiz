import type { Question } from './types';
import type { ThemeFilter, TopicTag, PantheonFilter } from '../storage/schema';

export const allTopicTags: TopicTag[] = ['olymp', 'helden', 'monster', 'mythen'];
export const allPantheons: PantheonFilter[] = ['beide', 'griechisch', 'roemisch'];

const TOPIC_LABEL: Record<TopicTag, string> = {
  olymp: 'Olymp',
  helden: 'Held:innen',
  monster: 'Monster',
  mythen: 'Mythen',
};

const PANTHEON_LABEL: Record<PantheonFilter, string> = {
  beide: 'Beide',
  griechisch: 'Griechisch',
  roemisch: 'Römisch',
};

export function topicLabel(t: TopicTag): string {
  return TOPIC_LABEL[t];
}

export function pantheonLabel(p: PantheonFilter): string {
  return PANTHEON_LABEL[p];
}

/**
 * Reduce the pool by the orthogonal theme filter: topics AND pantheon.
 *  - topics: empty = no topic constraint; otherwise question.themes must
 *    contain at least one of the selected topic tags.
 *  - pantheon: 'beide' = no pantheon constraint; otherwise question.pantheon
 *    must match (questions tagged 'beide' pass any pantheon filter).
 */
export function filterByTheme(pool: Question[], filter: ThemeFilter): Question[] {
  return pool.filter(q => {
    const topicOk =
      filter.topics.length === 0 || filter.topics.some(t => q.themes.includes(t));
    const pantheonOk =
      filter.pantheon === 'beide' || q.pantheon === 'beide' || q.pantheon === filter.pantheon;
    return topicOk && pantheonOk;
  });
}

/**
 * Short human-readable summary of a filter, for the ThemeChip on Home
 * and the round list in Stats.
 */
export function themeFilterSummary(filter: ThemeFilter): string {
  const topicsPart =
    filter.topics.length === 0
      ? 'Alle Themen'
      : filter.topics.map(topicLabel).join(' · ');
  const pantheonPart =
    filter.pantheon === 'beide' ? null : pantheonLabel(filter.pantheon);
  return pantheonPart ? `${topicsPart} · ${pantheonPart}` : topicsPart;
}
