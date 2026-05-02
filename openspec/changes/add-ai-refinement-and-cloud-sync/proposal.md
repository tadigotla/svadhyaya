## Why

Svādhyāya's value depends on the user actually capturing reflections, but long-form thumb-typing on a 6" Samsung-class phone — the dominant device for after-session reflection — is the friction that kills adoption. The original tool was designed at "minimum viable journal"; the next coherent shape uses an LLM to *sharpen* what the user types (not generate for them), so a thumb-typed stream-of-consciousness becomes a structured Gibbs reflection. Cloud sync via Google login lifts the device-lock-in that today forces manual JSON export between phone and laptop.

This is an evolution of the tool's spirit, not a successor product: the journal still exists for honest self-audit (`svādhyāya`), the LLM still treats the user's words as primary, and progress still isn't gamified. But several non-goals from the original README are replaced with new, narrower commitments documented in this proposal.

## What Changes

- **AI refinement per Gibbs stage** — six per-textarea affordances (each stage gets a *different* LLM role: Description tidies recall, Feelings asks one Socratic question, Evaluation separates "worked" from "felt productive," Analysis pushes one more "but why," Conclusion tightens to one sentence, Action Plan SMART-ifies). Output goes through accept/reject UI; user's original is never auto-replaced.
- **Google sign-in** via Firebase Auth as the only auth method (no email/password complexity).
- **Cloud sync** of reflections via Firestore, with **client-side encryption** so reflection plaintext never reaches Google's servers. Encryption key derived from the user's Google account ID + a passphrase the user sets once. Loses passphrase recovery; preserves "even Google can't read your reflections."
- **BYOK Anthropic API key** stored in the browser (never synced, never sent to Firestore). User pays Anthropic directly. AI features are gated behind the user supplying a key in Settings.
- **Prompt-injection defenses baked in by default** — XML-tagged structural separation in prompts, plain-text rendering of LLM output (closes markdown-image exfiltration), schema-shaped outputs, no LLM tools, and JSON-imported entries quarantined from cross-entry context until reviewed.
- **Mobile-first responsive redesign** targeting ≥360px viewport (S-series Samsungs in portrait), with thumb-reachable AI buttons under each textarea, sticky save bar, 16px+ inputs to prevent auto-zoom, dark-mode via `prefers-color-scheme`, and safe-area insets.
- **Guest mode** — the app still works without sign-in, with localStorage-only behavior matching today's experience minus AI features.
- **BREAKING:** README "Privacy & data" and "Non-goals" sections rewritten. The promises "no network requests," "no accounts," "no backend," and "no AI-generated reflections or feedback" no longer hold; new narrower commitments take their place ("reflection plaintext never leaves your browser unencrypted," "AI sharpens your words, never replaces them," "no streaks, no metrics, no gamification").
- **Migration path** — first sign-in offers to upload existing localStorage entries to encrypted Firestore.

## Capabilities

### New Capabilities

- `ai-refinement`: Per-Gibbs-stage LLM-assisted refinement of user-authored reflection text, with stage-specific affordances, structured output, accept/reject UX, and a complete prompt-injection defense posture.
- `cloud-sync`: Google-authenticated Firestore sync of reflection entries with end-to-end client-side encryption, offline queue, optimistic local writes, and migration of existing localStorage entries.
- `byok-config`: User-supplied Anthropic API key management — Settings UI, browser-only storage, validation against Anthropic's API, and clear opt-in/disable controls for AI features.
- `mobile-responsive-ui`: Mobile-first responsive layout meeting a 360px viewport floor, with thumb-reachable affordances, virtual-keyboard-aware sticky actions, dark-mode support, and accessibility minimums (≥44px tap targets, 16px+ inputs).

### Modified Capabilities

None. No prior specs exist in `openspec/specs/`.

## Impact

- **Code**: `index.html` restructured significantly. Currently a single ~1150-line self-contained file; will grow to include Firebase Web SDK imports, Anthropic SDK calls, settings panel, and per-stage AI affordances. Single-file goal preserved where practical, but the file is no longer self-contained at the network level (it loads Firebase SDK and calls Anthropic).
- **Dependencies (network)**: previously Google Fonts only. Adds Firebase Auth, Firebase Firestore, and Anthropic API. All other-than-fonts traffic is opt-in (guest mode triggers no Firebase calls; AI features require an API key in Settings).
- **Dependencies (build)**: still no build step required; SDKs loaded via `<script type="module">` from CDNs. The "no build tooling" non-goal is preserved.
- **Infrastructure**: a new Firebase project (Auth + Firestore + Hosting optional). No Cloud Functions are required because BYOK means there is no API proxy to host. Firestore security rules become a critical artifact.
- **Privacy posture**: changes from "no network requests" to a layered model — guest mode (no network), signed-in mode (encrypted reflections in Firestore, no plaintext to Google), AI mode (reflection plaintext sent to Anthropic with the user's key, never stored by us).
- **Documentation**: README rewrite required for "Privacy & data," "Non-goals," and "How to use it." DEPLOY.md needs a Firebase setup section.
- **Existing users**: localStorage data is preserved and migratable; users who never sign in see no behavioral change beyond the new AI opt-ins.
