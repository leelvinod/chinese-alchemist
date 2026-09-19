/* Derive the render preferences every sentence primitive reads from settings. */

import { useEffect, useMemo, useState } from 'react';
import { useStore } from './store';
import type { Ui } from '../design/slots';
import { MM_THEME } from '../design/slots';

export function usePrefersDark(): boolean {
  const [dark, setDark] = useState(() =>
    typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)').matches : false,
  );
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const on = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
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
