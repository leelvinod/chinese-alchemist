/* Mandarin Mitra — the mic button.
   Idle · recording (waveform + countdown ring) · processing · unavailable.
   The 8-second countdown is SF-08's; after it runs out the learner gets a
   relaxed retry with no timer, because the timer is there to push, not to fail. */

import { useEffect, useRef, useState } from 'react';
import { Icon } from '../design/Icon';
import { Btn } from '../design/ui';
import { asrAvailable, listen } from '../engine/speech';
import type { AsrSession } from '../engine/speech';

type Phase = 'idle' | 'rec' | 'proc' | 'blocked';

export function MicButton({
  seconds,
  onTranscript,
  onGiveUp,
  label,
}: {
  /** null runs without a countdown — the relaxed retry. */
  seconds: number | null;
  onTranscript: (text: string) => void;
  /** Offered after two failed attempts, or when there is no recogniser at all. */
  onGiveUp?: () => void;
  label?: string;
}) {
  const [phase, setPhase] = useState<Phase>(() => (asrAvailable() ? 'idle' : 'blocked'));
  const [left, setLeft] = useState(seconds ?? 0);
  const [fails, setFails] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [timed, setTimed] = useState(seconds !== null);
  const timer = useRef<number | null>(null);
  const session = useRef<AsrSession | null>(null);

  const clear = () => {
    if (timer.current !== null) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };
  useEffect(() => () => {
    clear();
    session.current?.abort();
  }, []);

  const stop = () => {
    clear();
    session.current?.stop();
    setPhase('proc');
  };

  const start = () => {
    setHint(null);
    const s = listen({
      onResult: (r) => {
        clear();
        setPhase('idle');
        onTranscript(r.transcript);
      },
      onError: (reason) => {
        clear();
        session.current = null;
        if (reason === 'not-allowed') {
          setPhase('blocked');
          return;
        }
        setPhase('idle');
        setFails((f) => f + 1);
        setHint("Didn't catch that — try again closer to the mic.");
      },
    });
    if (!s) {
      setPhase('blocked');
      return;
    }
    session.current = s;
    setPhase('rec');

    if (timed && seconds !== null) {
      setLeft(seconds);
      timer.current = window.setInterval(() => {
        setLeft((v) => {
          if (v <= 1) {
            stop();
            // The next attempt is the relaxed one: same drill, no countdown.
            setTimed(false);
            return 0;
          }
          return v - 1;
        });
      }, 1000);
    }
  };

  if (phase === 'blocked') {
    return (
      <div
        style={{
          border: '1px solid var(--mm-line)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 14px 10px',
          width: '100%',
        }}
      >
        <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>
          Speaking is off on this device. You can type your answer instead.
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          {onGiveUp && (
            <Btn variant="secondary" onClick={onGiveUp}>
              <Icon name="keyboard" size={15} />
              Type instead
            </Btn>
          )}
        </div>
      </div>
    );
  }

  const R = 46;
  const C = 2 * Math.PI * R;
  const acc = 'var(--mm-accent)';
  const total = seconds ?? 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {phase === 'rec' && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 26 }} aria-hidden>
          {Array.from({ length: 13 }, (_, i) => (
            <span
              key={i}
              style={{
                width: 3,
                borderRadius: 2,
                background: acc,
                height: `${8 + 18 * Math.abs(Math.sin(i * 1.3 + left))}px`,
                transition: 'height .3s',
              }}
            />
          ))}
        </div>
      )}

      <button
        onClick={phase === 'idle' ? start : phase === 'rec' ? stop : undefined}
        aria-label={phase === 'rec' ? 'Stop recording' : 'Start recording'}
        style={{
          position: 'relative',
          width: 112,
          height: 112,
          borderRadius: '50%',
          border: 0,
          background: 'none',
          cursor: phase === 'idle' || phase === 'rec' ? 'pointer' : 'default',
          color: acc,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <svg width="112" height="112" viewBox="0 0 112 112" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx="56" cy="56" r={R} fill="none" stroke="var(--mm-line)" strokeWidth="2" />
          {phase === 'rec' && timed && (
            <circle
              cx="56"
              cy="56"
              r={R}
              fill="none"
              stroke={acc}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - left / total)}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          )}
          {(phase !== 'rec' || !timed) && (
            <circle cx="56" cy="56" r={R} fill="none" stroke={acc} strokeWidth="1.5" opacity={phase === 'idle' ? 0.9 : 0.4} />
          )}
        </svg>
        <span style={{ color: phase === 'proc' ? 'var(--mm-muted)' : acc }}>
          <Icon name="mic" size={36} />
        </span>
      </button>

      <div
        className="mm-num"
        style={{ fontSize: 12.5, color: 'var(--mm-muted)', minHeight: 18, textAlign: 'center' }}
        role="status"
      >
        {phase === 'idle' && (hint ?? label ?? (timed && seconds ? 'Tap to speak' : 'Tap to speak — no timer this time'))}
        {phase === 'rec' && (timed ? `${left} s — tap to stop` : 'Listening — tap to stop')}
        {phase === 'proc' && 'Checking…'}
      </div>

      {/* The keyboard is always one tap away, and after two misses it is named
          more plainly, because by then the learner wants it. */}
      {onGiveUp && phase === 'idle' && (
        <Btn variant="ghost" style={{ width: 'auto' }} onClick={onGiveUp}>
          <Icon name="keyboard" size={15} />
          {fails >= 2 ? 'Type it instead' : 'Type instead'}
        </Btn>
      )}
    </div>
  );
}
