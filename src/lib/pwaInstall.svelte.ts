// Capture the Chrome/Android `beforeinstallprompt` event so the About screen
// can offer an "Install" button. iOS Safari never fires this — detect iOS
// separately and show manual instructions instead.

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
let installed = $state<boolean>(false);
let initialized = false;

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
  // iOS Safari exposes `navigator.standalone` instead of the media query.
  return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function initPwaInstall(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  installed = detectStandalone();

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });

  window.addEventListener('appinstalled', () => {
    installed = true;
    deferredPrompt = null;
  });
}

export function hasInstallPrompt(): boolean {
  return deferredPrompt !== null;
}

export function isInstalled(): boolean {
  return installed;
}

export function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iPadOS 13+ reports as Mac; the touch-points check disambiguates.
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && navigator.maxTouchPoints > 1);
}

export async function triggerInstall(): Promise<void> {
  const prompt = deferredPrompt;
  if (!prompt) return;
  await prompt.prompt();
  const choice = await prompt.userChoice;
  if (choice.outcome === 'accepted') {
    deferredPrompt = null;
  }
}
