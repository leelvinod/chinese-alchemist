/* Chunks that recur across patterns. Keeping them here means a correction to a
   reading or a Hindi alignment lands everywhere at once. Hindi is optional per
   chunk: it is filled in only where the alignment is real, never invented to
   close a gap. */

import type { SentenceChunk } from '../../design/Sentence';

export const wo: SentenceChunk = { slot: 'subject', zh: '我', py: 'wǒ', roman: 'main', deva: 'मैं' };
export const ni: SentenceChunk = { slot: 'subject', zh: '你', py: 'nǐ', roman: 'tum', deva: 'तुम' };
export const ta: SentenceChunk = { slot: 'subject', zh: '他', py: 'tā', roman: 'vah', deva: 'वह' };
export const taF: SentenceChunk = { slot: 'subject', zh: '她', py: 'tā', roman: 'vah', deva: 'वह' };

export const mingtian: SentenceChunk = { slot: 'time', zh: '明天', py: 'míngtiān', roman: 'kal', deva: 'कल' };
export const zuotian: SentenceChunk = { slot: 'time', zh: '昨天', py: 'zuótiān', roman: 'kal', deva: 'कल' };
export const jintian: SentenceChunk = { slot: 'time', zh: '今天', py: 'jīntiān', roman: 'aaj', deva: 'आज' };

export const zaijia: SentenceChunk = { slot: 'place', zh: '在家', py: 'zài jiā', roman: 'ghar par', deva: 'घर पर' };
export const hen: SentenceChunk = { slot: 'manner', zh: '很', py: 'hěn' };
export const le: SentenceChunk = { slot: 'complement', zh: '了', py: 'le' };
