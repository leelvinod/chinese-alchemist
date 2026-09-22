/* Derive the render preferences every sentence primitive reads from settings. */

import { useEffect, useMemo, useState } from 'react';
import { useStore } from './store';
import type { Ui } from '../design/slots';
import { MM_THEME } from '../design/slots';

/* "System" means the surface the app is running on, and that is not always the
   OS. A host page can state a theme explicitly by stamping data-theme on the
   root element, and when it does, that beats prefers-color-scheme — the viewer
   chose it. Falling back to the media query covers the ordinary case. */
function readHostTheme(): 'dark' | 'light' | null {
  if (typeof document === 'undefined') return null;
  const stamped = document.documentElement.dataset.theme;
  return stamped === 'dark' || stamped === 'light' ? stamped : null;
}

function readSystemDark(): boolean {
  const host = readHostTheme();
  if (host) return host === 'dark';
  return typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)').matches : false;
}

export function usePrefersDark(): boolean {
  const [dark, setDark] = useState(readSystemDark);

  useEffect(() => {
    const sync = () => setDark(readSystemDark());

    const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
    mq?.addEventListener('change', sync);

    // The host can restamp the root at any time, so the attribute is watched
    // rather than read once at mount.
    const observer =
      typeof MutationObserver === 'function' && typeof document !== 'undefined'
        ? new MutationObserver(sync)
        : null;
    observer?.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    sync();
    return () => {
      mq?.removeEventListener('change', sync);
      observer?.disconnect();
    };
  }, []);

  return dark;
}

export function useUi(): Ui {
  const { state } = useStore();
  const systemDark = usePrefersDark();
  const s = state.settings;
  return useMemo(
    () => ({
      dark: s.theme === 'system' ? systemDark : s.theme === 'dark',
      mono: s.monoSlots,
      hindi: s.hindi,
      // 'fade' still shows pinyin on drill sentences; only the review card's
      // front hides it, and that screen overrides this locally.
      pinyin: s.pinyin !== 'off',
    }),
    [s.theme, s.monoSlots, s.hindi, s.pinyin, systemDark],
  );
}

/** The CSS variables for the active theme, spread onto the app shell. */
export function useThemeVars(ui: Ui): React.CSSProperties {
  return MM_THEME[ui.dark ? 'dark' : 'light'] as unknown as React.CSSProperties;
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false));
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}
