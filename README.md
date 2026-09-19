# Mandarin Mitra

Mandarin Mitra is a Mandarin-learning MVP designed for Indian learners. It focuses on one practical promise:

> Speak Chinese in the right order, three minutes a day.

The product uses English as its primary teaching language and Hindi as a bridge for explaining transfer patterns. The current MVP demonstrates the learning system with a focused content set; it does not yet represent complete HSK coverage or a production service.

## Project overview: eight slides

### 1. Mandarin Mitra

**The three-minute learning promise**

Mandarin Mitra helps learners produce Chinese sentences in the correct order through short, focused daily practice.

Example sentence structure:

| Subject | Time | Place | Verb | Object |
| --- | --- | --- | --- | --- |
| 我 | 明天 | 在家 | 吃 | 饭 |
| I | tomorrow | at home | eat | food |

The core message is simple: learn the structure, build one sentence, and improve through repetition.

### 2. The learner problem

**Knowing words is not the same as building a sentence.**

Mandarin learners must understand that time, place, manner, verb, and object each have a role—and that their order matters.

Indian learners can also carry familiar language habits into Mandarin. For Hindi speakers, this may include the tendency to place the verb at the end. Mandarin Mitra makes sentence structure visible and teaches it as a repeatable system rather than a list of isolated rules.

### 3. Built for Indian learners

**One destination. Two bridges.**

The learning path is:

1. **English** — the primary teaching language.
2. **Hindi** — a bridge for explaining transfer patterns and common structural differences.
3. **Simplified Mandarin Chinese** — the target language.

HSK 1–4 is the intended long-term product scope. The current MVP contains a smaller launch set used to test the complete learning system.

### 4. The three-minute learning loop

Each practice session follows four steps:

1. **Open** — start a focused three-minute session.
2. **Build or say** — produce one Chinese sentence.
3. **Correct** — receive a structural question before seeing the answer.
4. **Adapt** — revisit weak patterns more often.

This loop is designed to move learners from passive recognition to active sentence production.

### 5. What the MVP includes

The current MVP provides a complete practice flow:

- **Onboarding** — adaptive placement that can be skipped or resumed.
- **Sentence Forge** — six ladder drills and sentence-joining practice.
- **Two-step feedback** — a structural question before the correction is revealed.
- **Hindi bridge** — a sentence composer, pinyin primer, and focused mini-modules.
- **Listening and review** — tone pairs, minimal pairs, and spaced review.
- **Progress tracking** — error trends, a pattern map, and a distinction between what learners recognize and what they can actively use.

### 6. How it works today

The MVP uses a local-first architecture:

- React, TypeScript, and Vite power the web interface.
- Learner progress is stored in `localStorage`.
- Structural grading runs on the device.
- Speech exercises use browser speech APIs.

Local implementations sit behind clear interfaces. Hosted grading, native speech, server-backed accounts, and other production services can replace them later without requiring the learning interface to be rebuilt.

### 7. Current MVP boundaries

The product works as an MVP, but several production capabilities are deliberately simulated or limited:

- **Accounts** — name and phone details are stored locally; there is no OTP flow or production identity system.
- **Payments** — the paywall simulates entitlement; no checkout provider is connected.
- **Content** — eight sentence patterns and twenty words demonstrate the system but do not provide full HSK coverage.
- **Native features** — speech support depends on the browser, and Android answer-in-notification functionality has not been built.

These boundaries separate working functionality from planned product development.

### 8. Proposed next steps

The path from the current MVP to a launch-ready product has three priorities:

1. **Expand content** — grow the pattern library, vocabulary, and error coverage toward HSK 1–4.
2. **Add production services** — introduce real accounts, synchronized progress, hosted grading, and checkout.
3. **Package for Android** — wrap the web app, add native speech capabilities, and support notifications.

## View the slide deck

The interactive eight-slide overview is available in the Replit artifact:

- **Artifact:** `Mandarin Mitra — Project Overview`
- **Source:** `artifacts/mandarin-mitra-overview`

The application source is located at `artifacts/mandarin-mitra`.