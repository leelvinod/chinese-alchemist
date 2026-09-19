# Mandarin Mitra

Simplified Mandarin (HSK 1–4) for Indian learners, taught through English with
Hindi as the bridge language.

This is the first working version of the product defined in *MVP Spec for
Design: Mandarin for Indian Learners*, built on the two design deliverables that
preceded it — the slot colour system and the core-loop prototype.

The whole app is one tight loop: open a 3-minute session, build or say one
Chinese sentence, get corrected in two steps, and watch your weak spots shrink.

```
npm install
npm run dev        # http://localhost:5173
npm test           # 162 tests
npm run build      # typecheck + production build
```

## Platform

The spec calls for an Android app. This first version is a **portrait mobile web
app** at 360–412 dp, written in React + TypeScript — the same stack the core-loop
prototype was written in, so the slot colour system ported over exactly. It runs
in a mobile browser today and is a Capacitor wrap away from a Play Store build;
nothing in the code assumes a browser except the speech layer, which is isolated
in `src/engine/speech.ts` behind an interface a native ASR/TTS plugin can
implement.

On a desktop screen the app renders inside a 412 dp frame, so the layout under
review is always the one that ships.

## What is here

| Spec section | Screens | State |
| --- | --- | --- |
| 5 Onboarding and placement | ON-01 … ON-10 | Built. Adaptive placement over a real item bank, skippable and resumable |
| 6 Today and the session | TD-01, SS-01, SS-02 | Built |
| 7 Sentence Forge | SF-01 … SF-09 | All six ladder drills plus join-sentences, with the live connector guard |
| 8 Feedback | FB-01 … FB-03 | Two-step correction, transfer cards, appeal sheet |
| 9 Hindi bridge | BR-01 … BR-03 | Composer, Indic pinyin primer, three mini-modules |
| 10 Listening | LS-01, LS-02 | Tone-pair trainer with heatmap, minimal pairs |
| 11 Vocabulary review | VR-01 | Three facets, four grades with intervals, daily cap |
| 12 Progress | PR-01, PR-02 | Generated headline, error trends, pattern map, know-vs-use |
| 13 Settings and paywall | ME-01, PW-01 | Built |
| 15 Global states | GS-xx | Offline queue, grading failure, ASR failure, mic denied, empty states |

## How it is put together

```
src/design/    the slot colour system, sentence primitives, chrome components
src/content/   patterns, vocabulary, listening, bridge and placement data
src/engine/    grader, ladder, scheduler, planner, placement, speech, offline queue
src/state/     the reducer, persistence, derived render preferences
src/screens/   one file per area of the spec
```

**The slot colour system** (`src/design/slots.ts`) is the load-bearing asset, ported
verbatim from deliverable 1. Eight slots, each a hue *plus* an underline weight and
style *plus* an icon, derived from one OKLCH lightness step. Colour never carries
meaning alone, so the mono palette in Settings is a real accessibility option
rather than a downgrade.

**The grader** (`src/engine/grader.ts`) stands in for the hosted grader the PRD
specifies. It is structural rather than semantic: it knows word order, missing
particles, measure words and the Hindi है habit, which is what the MVP actually
drills. It never returns a bare pass/fail — it names the slot to ask about, so
FB-01 can pose a question without revealing the answer.

**The content layer** is plain data. The content team extends `patterns.ts`,
`vocab.ts` and the rest; nothing else has to change. `src/content/content.test.ts`
is the contract the app assumes about that data — a bad row fails there rather
than in front of a learner. It checks, among other things, that every drill
grades its own model answer as correct.

## Deliberate substitutions

Three things the PRD puts on a server have local stand-ins, each isolated so the
real one drops in behind the same interface:

- **Speech.** Hosted ASR and TTS are replaced by the browser's `SpeechRecognition`
  (zh-CN) and `SpeechSynthesis`. Both can be absent, so every caller already
  handles the unavailable path — which is the same path the hosted version needs
  when the learner is offline.
- **Grading.** On-device, as above. The offline queue in `src/engine/queue.ts`
  already has the shape of a batched server call.
- **Payment.** The paywall flips a local entitlement. No provider is wired up, so
  UPI and card are labels rather than flows.

Accounts are local too: sign-in takes a name and a phone number and no OTP is
sent. Everything persists to `localStorage`, so progress is per-device.

## Known gaps

- **Kinship is grouped by side, not drawn as a tree.** The spec asks for a visual
  family tree; this version renders branch-grouped rows, which carries the
  mother's-side / father's-side distinction but not the shape.
- **Tone feedback is coarse.** Spoken answers are graded on the transcript, so
  tone errors surface as wrong words rather than as tone contours. Full tone
  scoring is Phase 2 in the spec, and the `TONE.wrong_tone` code is in the
  taxonomy waiting for it.
- **Answer-in-notification (NT-01) is not built.** It needs a real Android
  notification surface; the setting exists and does nothing yet.
- **Eight patterns and twenty words.** Enough to exercise every drill type and
  both transfer directions, far short of HSK 1–4 coverage.
- **The error taxonomy is the launch subset.** 21 of the 44 types the content team
  will deliver.

## Verification

162 tests cover the grader, ladder, scheduler, planner, placement, store and
content integrity (`npm test`). The build is typechecked under `strict` with
`noUncheckedIndexedAccess`.

Beyond the suite, the onboarding flow, the full core loop and every tab were
driven in a real browser at 390×844 and checked screen by screen. That pass found
three bugs now fixed: the say-it step inherited the previous drill's feedback
sheet, speaking drills ignored a denied mic permission, and the typed fallback
was hidden until two failed recordings.
