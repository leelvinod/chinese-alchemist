/* Mandarin Mitra — sign-in rules (ON-02).
   Phone OTP is the common path in India, so it is first-class alongside Google
   rather than a fallback. There is no auth backend in this version: no code is
   actually sent, and the app says so on screen rather than pretending. What is
   real is the validation — the shape of the flow, and every rule about what is
   accepted, lives here so it can be tested and later pointed at a real service. */

export const OTP_LENGTH = 6;

/** Digits only, with a leading + kept if there was one. */
export function normalisePhone(raw: string): string {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  return plus ? `+${digits}` : digits;
}

export const phoneDigits = (raw: string): string => raw.replace(/\D/g, '');

/** Why a number was rejected, in words the learner can act on. */
export type PhoneProblem = 'empty' | 'too-short' | 'too-long' | 'bad-characters' | null;

export function checkPhone(raw: string): PhoneProblem {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return 'empty';
  // A plus is allowed only at the front; anything else non-numeric is a typo.
  if (/[^\d\s()+-]/.test(trimmed) || trimmed.slice(1).includes('+')) return 'bad-characters';

  const digits = phoneDigits(trimmed);
  // An Indian mobile is 10 digits; with a country code it reaches 12. The band
  // is kept wide because the app should not refuse a number from elsewhere.
  if (digits.length < 10) return 'too-short';
  if (digits.length > 15) return 'too-long';
  return null;
}

export const isValidPhone = (raw: string): boolean => checkPhone(raw) === null;

export function phoneProblemMessage(problem: PhoneProblem): string | null {
  switch (problem) {
    case 'empty':
      return null; // Nothing typed yet is not an error to shout about.
    case 'too-short':
      return 'That looks too short — a mobile number is at least 10 digits.';
    case 'too-long':
      return 'That looks too long. Check for an extra digit.';
    case 'bad-characters':
      return 'Numbers only, with + for the country code.';
    default:
      return null;
  }
}

/** How the number is shown back once it has been accepted. */
export function displayPhone(raw: string): string {
  const digits = phoneDigits(raw);
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  const cc = digits.length > 10 ? digits.slice(0, digits.length - 10) : '91';
  return `+${cc} ${local.slice(0, 5)} ${local.slice(5)}`.trim();
}

export const isValidOtp = (code: string): boolean => new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code.trim());

/** Keep only digits, capped at the code length, as the learner types. */
export const cleanOtpInput = (raw: string): string => raw.replace(/\D/g, '').slice(0, OTP_LENGTH);

/** A first name from whatever the learner gave us. Empty is fine — the greeting
 *  on Today reads correctly without one, so a name is never a gate. */
export function cleanName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').slice(0, 40);
}
