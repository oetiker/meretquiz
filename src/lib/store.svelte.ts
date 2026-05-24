import { loadState, saveState } from '../storage/appState';
import { makeDefaultState, type AppState } from '../storage/schema';
import type { ViewName, ViewContext } from './router';

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
