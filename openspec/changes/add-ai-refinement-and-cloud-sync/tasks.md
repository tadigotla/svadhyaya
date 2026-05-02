## 1. Phase 1 — Mobile-first redesign of existing functionality

- [x] 1.1 Audit current `index.html` for hard-coded widths, fixed paddings, and tap targets below 44px
- [x] 1.2 Replace fixed sizes with fluid `clamp()` / `min()` / `max()` rules; introduce a 360px-floor mobile-first base style
- [x] 1.3 Set all `<input>` and `<textarea>` font-size to ≥16px
- [x] 1.4 Convert the save action to a sticky-bottom bar with `env(safe-area-inset-bottom)` padding
- [x] 1.5 Add `prefers-color-scheme: dark` palette and `prefers-reduced-motion` overrides
- [x] 1.6 Verify single-column layout under 768px; allow optional wider layout above
- [ ] 1.7 Manual QA on Samsung Internet, Chrome Android, iOS Safari, Chrome desktop, Firefox desktop
- [ ] 1.8 Land Phase 1 as a standalone, releasable PR (no AI, no Firebase yet)

## 2. Phase 2 — Settings panel and BYOK key management

- [x] 2.1 Add a Settings tab/panel reachable from the main reflection form
- [x] 2.2 Add an Anthropic API key input (masked, with a "Show" toggle)
- [x] 2.3 Implement `validateApiKey(key)` that performs a minimal Anthropic call (1-token completion) to confirm the key is accepted
- [x] 2.4 Persist the validated key to `localStorage` under a documented key name; never write to Firestore
- [x] 2.5 Add the security disclosure text above the input ("stored in this browser, you pay Anthropic, do not enter on untrusted devices")
- [x] 2.6 Implement key removal: clears localStorage and re-renders to hide AI affordances
- [x] 2.7 Confirm the key never appears in console.logs, error messages, or any DOM element other than the masked Settings input
- [x] 2.8 Add a CSP `<meta http-equiv="Content-Security-Policy">` tag scoping script-src to known origins
- [x] 2.9 Verify the CSP `script-src` allowlist against the actual Firebase Web SDK origin list at the version pinned in Phase 4; document the verification date and SDK version in a comment next to the meta tag

## 3. Phase 2 — Per-stage AI affordances and prompt-injection defenses

- [x] 3.1 Add the Anthropic Web SDK as an ES module import; configure with `dangerouslyAllowBrowser: true`
- [x] 3.2 Define a per-stage system-prompt object literal (six entries: description, feelings, evaluation, analysis, conclusion, action)
- [x] 3.3 Implement `wrapUserText(text)` that wraps content in `<reflection>...</reflection>` tags and includes the structural-separation instruction in the system prompt
- [x] 3.4 Define per-stage tool/output schemas (`{refined_text}` for description/evaluation/conclusion/action, `{question}` for feelings/analysis)
- [x] 3.5 Implement `callRefine(stageKey, userText, apiKey)` returning a parsed schema-shaped object or a typed error
- [x] 3.6 Set `max_tokens` per affordance, capped at 512
- [x] 3.7 Add a "Sharpen" / per-stage button beneath each textarea, labelled per the stage table in design.md
- [x] 3.8 Hide all AI affordances when no validated API key is configured
- [x] 3.9 Build the accept/reject UI: stack original above proposal on mobile; two clear buttons; no auto-replace
- [x] 3.10 Render every byte of LLM output via `textContent`; never `innerHTML`; verify with a unit-style test
- [x] 3.10a Add a repo-level grep check (script invokable from a PR description) that fails if any Anthropic call bypasses the shared `callAnthropic()` helper or if any LLM-output render path uses `innerHTML`; run it before merge of every PR touching `ai.*` code
- [x] 3.11 Reject parses that fail the schema; surface a generic retry message
- [x] 3.12 Surface friendly errors for network failure, 401/403, rate limit, and other Anthropic errors; never expose the API key in messages
- [x] 3.13 Add a developer test that submits a known prompt-injection payload as user text and confirms the model output remains task-shaped (manual or recorded fixture)
- [x] 3.14 Add a `provenance` field to the entry data model (`"local" | "imported"`); set on JSON import; reserve for future cross-entry context exclusion
- [ ] 3.15 Land Phase 2 as a PR; AI works in guest mode

## 4. Phase 3 — Voice capture *(dropped from scope; see design.md D6)*

## 5. Phase 4 — Firebase setup

- [ ] 5.1 Create a Firebase project; enable Authentication (Google provider) and Firestore (Native mode) *(user action — checklist in DEPLOY.md)*
- [x] 5.2 Configure Firestore security rules: per-user reads/writes scoped to `request.auth.uid`; deny all other access
- [~] 5.2a Author a Firebase emulator rules-test suite that asserts: (a) authenticated user A cannot read or write any document under `users/{B}/...`; (b) unauthenticated reads/writes are denied; (c) authenticated user A can read and write their own `users/{A}/entries/{id}` documents. Run this suite as a precondition for shipping Phase 4 and on every Security Rules change thereafter *(test code written in `tests/firestore-rules.test.mjs`; awaits emulator run by user)*
- [x] 5.3 Add the Firebase Web SDK as ES module imports (Auth, Firestore)
- [x] 5.4 Initialize Firebase with the project's client config in `index.html`
- [x] 5.5 Implement Google sign-in / sign-out UI in the Settings panel
- [ ] 5.6 Set a Firebase budget alert at $10/month *(user action — checklist in DEPLOY.md)*
- [x] 5.7 Document the Firebase project setup steps in DEPLOY.md

## 6. Phase 4 — Client-side encryption

- [x] 6.0 Decide PBKDF2 iteration count before implementation: confirm 310,000 vs OWASP-current SHA-256 PBKDF2 guidance (which has moved toward 600,000); record the chosen value and the reasoning (perf measurement on a target Samsung-class device + OWASP/NIST citation date) in a comment next to `deriveMasterKey`
- [x] 6.1 Implement `deriveMasterKey(passphrase, uid)` using Web Crypto PBKDF2 (iterations per 6.0, SHA-256, salt = UTF-8 of `uid`)
- [x] 6.2 Implement `encryptField(plaintext, key)` returning `{ciphertext, iv}` using AES-GCM-256 with a fresh 96-bit IV
- [x] 6.3 Implement `decryptField(ciphertext, iv, key)` returning the plaintext or throwing a typed decryption error
- [x] 6.4 Implement an encrypt-then-decrypt smoke test on every key derivation; surface a passphrase-mismatch error on failure
- [x] 6.5 Cache the derived master key in IndexedDB keyed by Firebase UID; clear on sign-out
- [x] 6.6 First-sign-in passphrase prompt; subsequent-device passphrase prompt; no recovery path documented as a constraint
- [x] 6.7 Passphrase entry UI explicitly urges saving in a password manager (copy: "Save this in your password manager. If you lose it, your cloud reflections cannot be recovered."); confirm the warning is present at both first-set and subsequent-device prompts

## 7. Phase 4 — Firestore data model and sync

- [x] 7.1 Define the Firestore document shape: `{id, createdAt, updatedAt, schemaVersion, provenance, ivByField, ciphertextByField, durationMinutes, dateOnly}`
- [x] 7.2 Implement `saveEntry(entry)` for signed-in users: encrypt fields, write to Firestore under `users/{uid}/entries/{entryId}`, mirror to localStorage immediately
- [x] 7.3 Implement `loadEntries()` for signed-in users: read from Firestore, decrypt client-side, merge with any local-only entries
- [x] 7.4 Implement an offline write queue using IndexedDB; flush when the browser reports back online *(satisfied via Firestore `persistentLocalCache` — its built-in IndexedDB queue replays automatically when connectivity returns)*
- [x] 7.5 Implement the one-time migration prompt on first sign-in: count localStorage entries, prompt with "Move them" / "Keep local only", encrypt-and-upload on accept, retain local copies
- [x] 7.6 Confirm signed-in JSON export decrypts client-side and emits plaintext; confirm no plaintext is written to Firestore in the export flow
- [x] 7.7 Confirm guest mode (not signed in) makes zero Firebase requests

## 8. Phase 5 — Documentation rewrite

- [x] 8.1 Rewrite README "Privacy & data" as a mode-by-mode table (guest / signed-in / AI) with what leaves the browser and who can read it
- [x] 8.2 Rewrite README "Non-goals" with the new narrower commitments listed in the proposal
- [x] 8.3 Update README "How to use it" to cover sign-in, AI affordances, and the BYOK Anthropic key
- [x] 8.4 Add a Firebase setup section to DEPLOY.md
- [x] 8.5 Update the "Why this exists" section if needed; preserve the svādhyāya framing *(reviewed; existing copy still holds — no rewrite needed)*

## 9. Phase 6 — Release

- [ ] 9.1 Final manual QA pass on the full test matrix (Samsung Internet, Chrome Android, iOS Safari, Chrome desktop, Firefox desktop)
- [ ] 9.2 Verify guest-mode is fully functional and makes no Firebase calls
- [ ] 9.3 Verify a clean sign-out returns the app to a guest-mode-equivalent state
- [ ] 9.4 Verify the encryption smoke test fails loudly with a mismatched passphrase
- [ ] 9.5 Verify all five capability spec scenarios pass on the running site
- [ ] 9.6 Merge to `main` and confirm GitHub Pages deploys
- [ ] 9.7 Verify the deployed site at `https://tadigotla.github.io/svadhyaya/` end-to-end
