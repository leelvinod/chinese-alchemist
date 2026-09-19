/* Mandarin Mitra — speech.
   The PRD specifies hosted ASR and hosted TTS. Until those endpoints exist this
   uses the browser's own speech APIs, which are the closest honest stand-in:
   SpeechSynthesis for playback and SpeechRecognition (zh-CN) for dictation.
   Both are absent on some Android browsers, so every caller has to handle
   `available === false` — that is the same code path the hosted version needs
   when the learner is offline. */

export interface TtsHandle {
  speak: (text: string, opts?: { rate?: number; voiceIndex?: number }) => void;
  cancel: () => void;
  available: boolean;
  /** The voices we can offer, for the "voice variety" setting. */
  voices: () => SpeechSynthesisVoice[];
}

const ZH = /^zh/i;

export function createTts(): TtsHandle {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
  const zhVoices = () => (synth?.getVoices() ?? []).filter((v) => ZH.test(v.lang));

  return {
    available: !!synth,
    voices: zhVoices,
    cancel: () => synth?.cancel(),
    speak: (text, opts = {}) => {
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = opts.rate ?? 1;
      const vs = zhVoices();
      if (vs.length > 0) {
        const i = opts.voiceIndex === undefined ? 0 : opts.voiceIndex % vs.length;
        const v = vs[i];
        if (v) u.voice = v;
      }
      synth.speak(u);
    },
  };
}

export type AsrStatus = 'idle' | 'listening' | 'processing' | 'error';

export interface AsrResult {
  transcript: string;
  /** 0–1 where the engine reports it. */
  confidence: number;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type SRCtor = new () => SpeechRecognitionLike;

function srCtor(): SRCtor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export const asrAvailable = () => !!srCtor();

export interface AsrSession {
  stop: () => void;
  abort: () => void;
}

/** Start dictation. Returns null when the browser has no recogniser, which the
 *  caller shows as "Speaking is off — type instead". */
export function listen(handlers: {
  onResult: (r: AsrResult) => void;
  onError: (reason: 'no-speech' | 'not-allowed' | 'other') => void;
  onEnd?: () => void;
}): AsrSession | null {
  const Ctor = srCtor();
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = 'zh-CN';
  rec.continuous = false;
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  let got = false;
  rec.onresult = (e) => {
    const alt = e.results[0]?.[0];
    if (alt) {
      got = true;
      handlers.onResult({ transcript: alt.transcript, confidence: alt.confidence ?? 0 });
    }
  };
  rec.onerror = (e) => {
    const reason = e.error === 'no-speech' ? 'no-speech' : e.error === 'not-allowed' ? 'not-allowed' : 'other';
    handlers.onError(reason);
  };
  rec.onend = () => {
    if (!got) handlers.onError('no-speech');
    handlers.onEnd?.();
  };

  try {
    rec.start();
  } catch {
    return null;
  }
  return { stop: () => rec.stop(), abort: () => rec.abort() };
}

/** Whether the mic itself is permitted, asked without starting a recording. */
export async function micPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unknown'> {
  if (typeof navigator === 'undefined' || !navigator.permissions) return 'unknown';
  try {
    const st = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return st.state as 'granted' | 'denied' | 'prompt';
  } catch {
    return 'unknown';
  }
}
