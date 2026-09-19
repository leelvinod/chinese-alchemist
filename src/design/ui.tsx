/* Mandarin Mitra — chrome components.
   Every drill is a full-screen modal: close at top left, progress bar, no tabs.
   Primary actions sit in the bottom third and clear 48 dp. */

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';
import { MM_DV, fbCorrect, fbMinor } from './slots';
import type { Ui } from './slots';

export function Screen({
  children,
  pad = true,
  scroll = true,
}: {
  children: ReactNode;
  pad?: boolean;
  scroll?: boolean;
}) {
  return (
    <div
      className={scroll ? 'mm-scroll' : undefined}
      style={{
        position: 'relative',
        minHeight: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--mm-bg)',
        color: 'var(--mm-ink)',
        fontFamily: 'var(--font-body)',
        padding: pad ? '0 18px' : 0,
      }}
    >
      {children}
    </div>
  );
}

export function TopBar({
  onClose,
  progress,
  title,
  closeIcon = 'x',
}: {
  onClose?: () => void;
  progress?: number;
  title?: string;
  closeIcon?: 'x' | 'chevronLeft';
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 10px', flex: 'none' }}>
      {onClose ? (
        <button
          onClick={onClose}
          aria-label={closeIcon === 'x' ? 'Close' : 'Back'}
          style={{
            width: 44,
            height: 44,
            marginLeft: -12,
            display: 'grid',
            placeItems: 'center',
            background: 'none',
            border: 0,
            color: 'var(--mm-ink)',
            cursor: 'pointer',
          }}
        >
          <Icon name={closeIcon} size={20} />
        </button>
      ) : (
        <span style={{ width: 8 }} />
      )}
      {progress !== undefined && (
        <div
          style={{ flex: 1, height: 2, background: 'var(--mm-line)', borderRadius: 2 }}
          role="progressbar"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            style={{
              width: `${Math.min(1, Math.max(0, progress)) * 100}%`,
              height: '100%',
              background: 'var(--mm-accent)',
              transition: 'width .4s ease',
            }}
          />
        </div>
      )}
      {progress === undefined && <span style={{ flex: 1 }} />}
      {title && (
        <span
          style={{ fontSize: 11, letterSpacing: '.06em', color: 'var(--mm-muted)', whiteSpace: 'nowrap' }}
        >
          {title}
        </span>
      )}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  disabled,
  variant = 'primary',
  style,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: React.CSSProperties;
  ariaLabel?: string;
}) {
  const [h, setH] = useState(false);
  const acc = 'var(--mm-accent)';
  const base: React.CSSProperties = {
    width: '100%',
    minHeight: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: 'var(--font-heading)',
    fontWeight: 600,
    fontSize: 16,
    letterSpacing: '.01em',
    borderRadius: 'var(--radius-md)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'background .15s',
  };
  const v: React.CSSProperties =
    variant === 'primary'
      ? {
          color: acc,
          border: `1px solid ${acc}`,
          background: h && !disabled ? 'color-mix(in srgb, var(--mm-accent) 12%, transparent)' : 'transparent',
        }
      : variant === 'secondary'
        ? {
            color: 'var(--mm-ink)',
            border: '1px solid var(--mm-line)',
            background: h ? 'color-mix(in srgb, var(--mm-ink) 7%, transparent)' : 'transparent',
          }
        : {
            color: 'var(--mm-muted)',
            border: '1px solid transparent',
            background: 'transparent',
            fontSize: 14,
            minHeight: 44,
          };
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ ...base, ...v, ...style }}
    >
      {children}
    </button>
  );
}

/** Feedback and detail sheets slide up over the drill, so the learner's own
 *  sentence stays visible above them. */
export function Sheet({
  children,
  accent,
  open,
  labelledBy,
}: {
  children: ReactNode;
  accent?: string;
  open: boolean;
  labelledBy?: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={labelledBy}
      aria-hidden={!open}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
        maxHeight: '86%',
        overflowY: 'auto',
        background: 'var(--mm-surface)',
        borderTop: `2px solid ${accent ?? 'var(--mm-line)'}`,
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 -12px 32px rgba(0,0,0,.18)',
        padding: '16px 18px 20px',
        transform: open ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform .28s cubic-bezier(.2,.8,.3,1)',
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      <div
        style={{ width: 34, height: 3, borderRadius: 3, background: 'var(--mm-line)', margin: '-6px auto 12px' }}
      />
      {children}
    </div>
  );
}

export function SheetTitle({
  children,
  color,
  id,
}: {
  children: ReactNode;
  color?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 600,
        fontSize: 19,
        color: color ?? 'var(--mm-ink)',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

/** The transfer card: one sentence about Hindi, carrying a हिं badge, never a flag.
 *  Positive transfer uses the correct accent, negative the minor accent. */
export function TransferCard({
  ui,
  positive,
  children,
  onDismiss,
}: {
  ui: Ui;
  positive?: boolean;
  children: ReactNode;
  onDismiss?: () => void;
}) {
  const c = positive ? fbCorrect(ui) : fbMinor(ui);
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        border: `1px solid ${c}`,
        borderRadius: 'var(--radius-md)',
        padding: '10px 12px',
        marginTop: 12,
      }}
    >
      <span
        style={{
          fontFamily: MM_DV,
          fontSize: 12,
          lineHeight: 1.6,
          color: c,
          border: `1px solid ${c}`,
          borderRadius: 3,
          padding: '0 5px',
          flex: 'none',
        }}
      >
        हिं
      </span>
      <span style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--mm-ink)', flex: 1 }}>{children}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: 'none',
            border: 0,
            color: 'var(--mm-muted)',
            cursor: 'pointer',
            padding: 2,
            flex: 'none',
          }}
        >
          <Icon name="x" size={13} />
        </button>
      )}
    </div>
  );
}

export function Chip({
  icon,
  children,
  onClick,
  accent,
}: {
  icon?: string;
  children: ReactNode;
  onClick?: () => void;
  accent?: boolean;
}) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        color: accent ? 'var(--mm-accent)' : 'var(--mm-muted)',
        border: `1px solid ${accent ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
        borderRadius: 20,
        padding: '5px 11px',
        minHeight: onClick ? 36 : undefined,
        background: 'none',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {icon && <Icon name={icon} size={13} />}
      {children}
    </Tag>
  );
}

export function Kicker({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <div className="mm-kicker" style={{ color: color ?? 'var(--mm-accent)' }}>
      {children}
    </div>
  );
}

export function Divider({ margin = '14px 0' }: { margin?: string }) {
  return <div style={{ height: 1, background: 'var(--mm-line)', margin }} />;
}

/** The helper row: hint, Hindi, listen. Sits above the action bar. */
export function HelperRow({
  ui,
  onHint,
  onHindi,
  onListen,
  hindiLabel,
  hintOn,
  hindiOn,
}: {
  ui: Ui;
  onHint?: () => void;
  onHindi?: () => void;
  onListen?: () => void;
  hindiLabel?: string;
  hintOn?: boolean;
  hindiOn?: boolean;
}) {
  const item = (icon: string, label: string, fn: () => void, on?: boolean) => (
    <button
      key={label}
      onClick={fn}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 44,
        padding: '0 10px',
        background: 'none',
        border: 0,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 12.5,
        color: on ? 'var(--mm-accent)' : 'var(--mm-muted)',
      }}
    >
      <Icon name={icon} size={14} />
      {label}
    </button>
  );
  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        justifyContent: 'center',
        borderTop: '1px solid var(--mm-line)',
        marginTop: 'auto',
        flex: 'none',
      }}
    >
      {onHint && item('lightbulb', 'Hint', onHint, hintOn)}
      {ui.hindi !== 'off' && onHindi && item('sound', hindiLabel ?? 'Hindi', onHindi, hindiOn ?? true)}
      {onListen && item('sound', 'Listen', onListen)}
    </div>
  );
}

/** Grading shimmer. Neutral: no colour until there is a verdict. */
export function Shimmer({ height = 40 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: 4,
        background: 'linear-gradient(90deg,var(--mm-line),transparent,var(--mm-line))',
        backgroundSize: '200% 100%',
        animation: 'mm-shimmer 1.2s linear infinite',
      }}
    />
  );
}

export function Toast({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="mm-fade-up"
      style={{
        position: 'absolute',
        left: 18,
        right: 18,
        bottom: 96,
        zIndex: 8,
        background: 'var(--mm-surface)',
        border: '1px solid var(--mm-line)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        fontSize: 13,
        textAlign: 'center',
        boxShadow: '0 6px 20px rgba(0,0,0,.14)',
      }}
    >
      {children}
    </div>
  );
}

export function Banner({
  children,
  onClick,
  icon,
}: {
  children: ReactNode;
  onClick?: () => void;
  icon?: string;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        textAlign: 'left',
        border: '1px solid var(--mm-accent)',
        borderRadius: 'var(--radius-md)',
        padding: '11px 13px',
        background: 'color-mix(in srgb, var(--mm-accent) 8%, transparent)',
        color: 'var(--mm-ink)',
        fontSize: 13,
        fontFamily: 'var(--font-body)',
        cursor: onClick ? 'pointer' : 'default',
        minHeight: 48,
      }}
    >
      {icon && (
        <span style={{ color: 'var(--mm-accent)' }}>
          <Icon name={icon} size={16} />
        </span>
      )}
      <span style={{ flex: 1 }}>{children}</span>
      {onClick && (
        <span style={{ color: 'var(--mm-accent)' }}>
          <Icon name="chevron" size={15} />
        </span>
      )}
    </Tag>
  );
}

/** Five-state mastery stepper, used on SS-02 and pattern detail. */
export const LADDER_LABELS = ['Introduced', 'Recognised', 'Scaffolded', 'Free', 'Stable'] as const;

export function MasteryStepper({ at }: { at: number }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {LADDER_LABELS.map((s, i) => (
          <span key={s} style={{ display: 'contents' }}>
            {i > 0 && (
              <span style={{ flex: 1, height: 1, background: i <= at ? 'var(--mm-accent)' : 'var(--mm-line)' }} />
            )}
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                flex: 'none',
                border: `1.5px solid ${i <= at ? 'var(--mm-accent)' : 'var(--mm-line)'}`,
                background: i === at ? 'var(--mm-accent)' : 'transparent',
              }}
            />
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 9.5, color: 'var(--mm-muted)' }}>
        {LADDER_LABELS.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </div>
  );
}

export function MasteryChip({ state }: { state: number }) {
  const label = LADDER_LABELS[Math.max(0, Math.min(4, state))];
  return (
    <span
      style={{
        fontSize: 10,
        letterSpacing: '.04em',
        padding: '2px 8px',
        borderRadius: 3,
        border: '1px solid var(--mm-line)',
        color: state >= 3 ? 'var(--mm-accent)' : 'var(--mm-muted)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

export function EmptyState({ children, icon = 'chart' }: { children: ReactNode; icon?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '34px 16px',
        textAlign: 'center',
        color: 'var(--mm-muted)',
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      <span style={{ opacity: 0.4 }}>
        <Icon name={icon} size={30} />
      </span>
      {children}
    </div>
  );
}
