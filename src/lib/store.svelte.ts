import { loadState, saveState, toggleLexikonRead } from '../storage/appState';
import { makeDefaultState, type AppState } from '../storage/schema';
import type { ViewName, ViewContext } from './router';
import type { EntryRef } from '../lexikon/types';

let appState = $state<AppState>(makeDefaultState());
let view = $state<ViewName>('home');
let viewContext = $state<ViewContext>({});

let hydrated = false;

export function getAppState(): AppState {
  return appState;
}

export function setAppState(next: AppState): void {
  appState = next;
  saveState(next);
}

export function hydrate(): void {
  if (hydrated) return;
  appState = loadState();
  hydrated = true;
}

export function getView(): ViewName {
  return view;
}

export function navigate(next: ViewName, ctx: ViewContext = {}): void {
  view = next;
  viewContext = ctx;
}

export function getViewContext(): ViewContext {
  return viewContext;
}

export interface LexikonUiState {
  open: boolean;
  stack: EntryRef[]; // empty = list view; last item = currently shown entry
}

let lexikon = $state<LexikonUiState>({ open: false, stack: [] });

export function getLexikon(): LexikonUiState {
  return lexikon;
}

export function openLexikon(): void {
  lexikon = { open: true, stack: [] };
}

export function openEntry(ref: EntryRef): void {
  lexikon = { open: true, stack: [ref] };
}

export function pushEntry(ref: EntryRef): void {
  lexikon = { open: true, stack: [...lexikon.stack, ref] };
}

export function popEntry(): void {
  lexikon = { open: lexikon.open, stack: lexikon.stack.slice(0, -1) };
}

export function closeLexikon(): void {
  lexikon = { open: false, stack: [] };
}

export function toggleLexikonReadCurrent(): void {
  const top = lexikon.stack[lexikon.stack.length - 1];
  if (!top) return;
  setAppState(toggleLexikonRead(appState, top));
}
