import type { GameModeId } from '../storage/schema';

export type ViewName = 'home' | 'themePicker' | 'quiz' | 'result' | 'stats';

export interface ViewContext {
  modeId?: GameModeId;          // set when navigating to 'quiz'
  resultRoundIndex?: number;    // index into state.rounds when navigating to 'result'
}
