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
npm test           # 257 tests
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
| 5 Onboarding and placement | ON-01 … ON-11 | Built. Adaptive placement over a real item bank, skippable and resumable |
| 6 Today and the session | TD-01, SS-01, SS-02 | Built |
| 7 Sentence Forge | SF-01 … SF-09 | All six ladder drills plus join-sentences, with the live connector guard |
| 8 Feedback | FB-01 … FB-03 | Two-step correction, transfer cards, appeal sheet |
| 9 Hindi bridge | BR-01 … BR-03 | Composer, Indic pinyin primer, three mini-modules |
| 10 Listening | LS-01, LS-02 | Tone-pair trainer with heatmap, minimal pairs |
| 11 Vocabulary review | VR-01 | Three facets, four grades with intervals, daily cap |
| 12 Progress | PR-01, PR-02 | Generated headline, error trends, pattern map, know-vs-use |
| 13 Notifications | NT-01 | Reminder scheduling with adaptive silence, and the overlay that answers without opening the app |
| 13 Settings and paywall | ME-01, PW-01 | Built |
| 15 Global states | GS-xx | Offline queue, grading failure, ASR failure, mic denied, empty states |

Plus ON-11 word import (CSV or TSV, reached from Me) and the coarse tone and
phoneme feedback section 8 asks for.

## How it is put together

```
src/design/            the slot colour system, sentence primitives, chrome components
src/content/           vocabulary, listening, bridge, placement and per-character readings
src/content/patterns/  grammar patterns, one file per HSK level
src/engine/            grader, ladder, scheduler, planner, placement, reminders,
                       speech, notifications, import, offline queue
src/state/             the reducer, persistence, derived render preferences
src/screens/           one file per area of the spec
public/                PWA manifest, icons and the service worker
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

**The content layer** is plain data: 16 patterns across HSK 1–4, 55 words, 37
placement items. The content team adds rows to `src/content/patterns/hsk*.ts`,
`vocab.ts` and the rest; nothing else has to change.
`src/content/content.test.ts` is the contract the app assumes about that data — a
bad row fails there rather than in front of a learner. It checks, among other
things, that every drill grades its own model answer as correct, and that every
character that can reach a learner has a reading in `pinyin.ts`.

**Pronunciation feedback** is coarse by design, as section 8 asks. Readings are
held per character, so a spoken answer can be compared syllable by syllable: the
right sounds with a drifted tone is a tone error, not a wrong word, and an
-n/-ng, aspiration or retroflex slip is named as the phoneme it is. Typed
answers are unaffected, because from a keyboard the same characters mean
something else entirely.

**Notifications** (`src/engine/reminders.ts`) hold the §13 rules as pure
functions — the adaptive silence tiers, the slot schedule, and the rule that a
prompt is never sent twice in a row — so they are tested without a clock or a
permission prompt.

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

**Notifications** work while the app has been opened at least once in the
session; there is no push server, so reminders are scheduled in the page rather
than delivered from a backend. The spec's open question — whether a notification
can host a hold-to-speak mic inline — is answered the way the spec itself
proposes: it cannot, here or on Android, so the notification carries the prompt
and the tap opens the overlay that holds the mic.

## Known gaps

- **Reminders need the page to have been open.** Without a push server they are
  scheduled in the page, so a reminder cannot fire on a device where the app has
  not been launched. The rules themselves are complete and tested; only the
  delivery is local.
- **Tone feedback is still coarse.** A drifted tone is caught only when the
  syllable is otherwise right, because the transcript is all there is to go on.
  Pitch tracking and a contour overlay are Phase 2 in the spec.
- **.apkg import is not supported.** An Anki package is a zipped SQLite
  database; import reads the CSV and TSV that Anki's own export produces.
- **Sixteen patterns and fifty-five words.** Every drill type and both transfer
  directions are exercised at every level, but this is nothing like HSK 1–4
  coverage.
- **The error taxonomy is the launch subset.** 21 of the 44 types the content
  team will deliver.
- **No backend.** Accounts, sync, the teacher-facing appeal queue and the hosted
  grader are all absent; FB-03 records an appeal locally and tells the learner a
  teacher will look, which will only be true once there is somewhere to send it.

## Verification

257 tests cover the grader, pronunciation diagnosis, ladder, scheduler, planner,
placement, reminders, word import, the store and content integrity
(`npm test`). The build is typechecked under `strict` with
`noUncheckedIndexedAccess`.

Beyond the suite, onboarding, the full core loop, every tab, the notification
overlay and word import were driven in a real browser at 390×844 and checked
screen by screen. Doing that has repeatedly found what the tests did not:

- The say-it step inherited the previous drill's feedback sheet, because React
  reused the component at the same position.
- Speaking drills ignored a denied mic permission, leaving the drill
  unanswerable, and hid the typed fallback until two failed recordings.
- Loose grading — used by build-freely and say-it — never checked word order, so
  "我去明天台北" was accepted as correct. That is the exact error the app exists
  to fix, being taught by the app.

Writing the tests found the rest: the grader blamed the anchor verb rather than
the chunk the learner moved, the wrong-classifier branch was unreachable, an
unbounded review interval overflowed `Date`, `blankSlot` could not address a
fill drill when a slot repeats (虽然…但是 blanked the wrong half), and the import
parser mistook English for pinyin and missed third-tone marks entirely.
