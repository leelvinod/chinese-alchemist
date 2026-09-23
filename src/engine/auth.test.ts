import { describe, expect, it } from 'vitest';
import {
  OTP_LENGTH,
  checkPhone,
  cleanName,
  cleanOtpInput,
  displayPhone,
  isValidOtp,
  isValidPhone,
  normalisePhone,
  phoneDigits,
  phoneProblemMessage,
} from './auth';

describe('normalisePhone', () => {
  it('strips the spacing people actually type', () => {
    expect(normalisePhone('+91 98765 43210')).toBe('+919876543210');
    expect(normalisePhone('(98765) 43210')).toBe('9876543210');
    expect(normalisePhone('98765-43210')).toBe('9876543210');
  });

  it('keeps a leading plus and drops one anywhere else', () => {
    expect(normalisePhone('+919876543210')).toBe('+919876543210');
    expect(phoneDigits('+919876543210')).toBe('919876543210');
  });
});

describe('checkPhone', () => {
  it('accepts a ten-digit Indian mobile', () => {
    expect(checkPhone('9876543210')).toBeNull();
    expect(isValidPhone('9876543210')).toBe(true);
  });

  it('accepts the same number with a country code and spacing', () => {
    expect(checkPhone('+91 98765 43210')).toBeNull();
  });

  it('does not refuse a number from outside India', () => {
    expect(checkPhone('+44 7700 900123')).toBeNull();
  });

  it('calls an empty field empty, not wrong', () => {
    expect(checkPhone('')).toBe('empty');
    expect(checkPhone('   ')).toBe('empty');
    // Nothing typed yet must not show a scolding message.
    expect(phoneProblemMessage('empty')).toBeNull();
  });

  it('names a number that is too short', () => {
    expect(checkPhone('98765')).toBe('too-short');
    expect(phoneProblemMessage('too-short')).toMatch(/10 digits/);
  });

  it('names a number that is too long', () => {
    expect(checkPhone('9876543210987654')).toBe('too-long');
  });

  it('names stray characters', () => {
    expect(checkPhone('98765abcde')).toBe('bad-characters');
    expect(checkPhone('9876+543210')).toBe('bad-characters');
    expect(phoneProblemMessage('bad-characters')).toMatch(/Numbers only/);
  });

  it('gives every problem a message the learner can act on, except empty', () => {
    for (const p of ['too-short', 'too-long', 'bad-characters'] as const) {
      expect(phoneProblemMessage(p), p).toBeTruthy();
    }
  });
});

describe('displayPhone', () => {
  it('shows a ten-digit number in the Indian grouping', () => {
    expect(displayPhone('9876543210')).toBe('+91 98765 43210');
  });

  it('keeps a country code the learner supplied', () => {
    expect(displayPhone('+447700900123')).toBe('+44 77009 00123');
  });
});

describe('otp', () => {
  it('wants exactly six digits', () => {
    expect(isValidOtp('123456')).toBe(true);
    expect(isValidOtp('12345')).toBe(false);
    expect(isValidOtp('1234567')).toBe(false);
    expect(OTP_LENGTH).toBe(6);
  });

  it('refuses letters', () => {
    expect(isValidOtp('12345a')).toBe(false);
  });

  it('keeps only digits as the learner types, capped at the code length', () => {
    expect(cleanOtpInput('12 34-56')).toBe('123456');
    expect(cleanOtpInput('123456789')).toBe('123456');
    expect(cleanOtpInput('abc')).toBe('');
  });
});

describe('cleanName', () => {
  it('trims and collapses whitespace', () => {
    expect(cleanName('  Priya   Sharma ')).toBe('Priya Sharma');
  });

  it('allows an empty name, because a name is never a gate', () => {
    expect(cleanName('   ')).toBe('');
  });

  it('caps a pasted essay', () => {
    expect(cleanName('a'.repeat(200)).length).toBe(40);
  });
});
