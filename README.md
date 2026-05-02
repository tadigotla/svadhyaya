# Svādhyāya

*A structured reflection journal for honest self-study, built around Gibbs' Reflective Cycle.*

*Originally built for Sanskrit study, but the structure works for any disciplined practice — language study, music, professional skills, meditation, workouts, post-mortems on a meeting or a hard conversation.*

<img src="screenshot.png" alt="Svādhyāya journal" style="max-width:600px; width:100%; height:auto;">

**[Try it →](https://tadigotla.github.io/svadhyaya/)** · Works fully without sign-in. Optional Google sign-in syncs your reflections across devices, end-to-end encrypted. Optional Anthropic API key sharpens your words after you've written them — never replaces them.

---

## What this is

A single HTML file. Open it in any browser and you have a private journal that walks you through the six stages of Gibbs' Reflective Cycle after a study session, a practice, a meeting, or any other discrete experience worth examining:

1. **Description** — What happened?
2. **Feelings** — What were you thinking and feeling?
3. **Evaluation** — What worked and what didn't?
4. **Analysis** — Why did it go that way?
5. **Conclusion** — What have you learned?
6. **Action Plan** — What will you do next?

All reflections live in your browser's `localStorage` by default. You can optionally sign in with Google to sync them across devices (encrypted before they leave your browser; see [Privacy & data](#privacy--data) below), and optionally bring your own Anthropic API key to enable per-stage AI affordances that *sharpen* what you've already written. Both are opt-in; the journal works fully without either. JSON and Markdown export are available regardless.

## Why this exists

Most language-learning journals are either unstructured free-text diaries or rigid tracker apps that reduce learning to streaks and counts. Sanskrit rewards a different approach. Progress is often invisible day-to-day — a śloka that bewildered you in March suddenly parses in May — and the obstacles are rarely about hours logged. They're about which techniques are actually transferring, which ones just *feel* productive, and where foundational gaps keep surfacing as new problems.

Gibbs' Reflective Cycle gives you a framework for that kind of honest audit. And `svādhyāya` (स्वाध्याय), self-study and self-examination, is itself a concept the tradition holds in high regard — so the practice of reflecting on Sanskrit study is continuous with the spirit of Sanskrit study.

## How to use it

**Online:** visit the [GitHub Pages link](https://tadigotla.github.io/svadhyaya) above.

**Offline:** download `index.html` and open it in your browser. No server, no build step, no installation. Bookmark the file or pin it to a folder you see often.

**Optional — sign in for cross-device sync:** Settings → *Cloud sync* → *Sign in with Google*. On first sign-in you'll be asked to set an encryption passphrase. **Save that passphrase in a password manager** — it's what encrypts your reflections before they reach Google. If you lose it, your cloud reflections cannot be recovered (your local copies are unaffected). On every new device you'll be prompted for the same passphrase to decrypt the cloud copy.

**Optional — bring your own Anthropic key for AI sharpening:** Settings → *Anthropic API key* → paste a key from [console.anthropic.com](https://console.anthropic.com) → *Save & validate*. Once a valid key is configured, each Gibbs stage gets a stage-specific affordance under its textarea (e.g. *Tidy timeline* on Description, *Ask me one question* on Feelings, *Make this concrete* on Action Plan). Tapping the affordance opens an inline panel: the per-stage *instruction* sent to the model is visible and editable inside the panel — tweak the wording and tap *Retry* to re-run, or tap *Accept* to integrate the answer (it replaces your text on rewrite stages, or appends the question on question stages). Closing the panel discards the proposal; your text is never auto-replaced. The prompt-injection defenses are locked and not editable. You pay Anthropic directly for usage.

**Suggested rhythm:**
- *Micro-cycle* — a quick 5-minute reflection after each study session. Even skipping fields is fine; the structure still does its work.
- *Macro-cycle* — once a month, re-read your journal. Look for recurring frustrations, techniques that keep appearing as effective, areas you keep avoiding.

## Privacy & data

The privacy posture depends on which optional features you've turned on. Each row below describes one mode independently — you can be in guest mode + AI mode without ever signing in, or signed in without an AI key, etc.

| Mode | What leaves your browser | Who can read it |
|---|---|---|
| **Guest** (default) | Only the Google Fonts CSS / font files. No reflections, no metadata. | No one but you. Reflections live in `localStorage` on this device. |
| **Signed in** | A 96-bit IV + AES-GCM-256 ciphertext per encrypted field, plus the entry id, timestamps, schema version, and date/duration metadata. | You only. Google sees encrypted bytes. The AES key is derived in your browser from a passphrase you set; Google never sees the passphrase or the key. |
| **AI** (key configured) | The text of the field you tap *Sharpen* on, sent to `api.anthropic.com` using your own API key. | Anthropic processes the request per their terms. Your key is stored only in this browser's `localStorage` and is never written to Firestore, never logged, and never displayed in the DOM after entry. |

A few things that hold across all modes:
- No analytics. No telemetry. No third-party JavaScript beyond the SDKs you opt into (Anthropic + Firebase, both loaded as ES modules from a single CDN).
- A `Content-Security-Policy` meta tag bounds outbound traffic to the origins listed above.
- Imported reflections (from a JSON backup) are marked `provenance: "imported"` and are excluded from any future cross-entry context features, so a malicious import can never hijack other entries' AI calls.
- You always own your data. JSON export is plaintext, regardless of which mode you're in — even when signed in, the export decrypts client-side and emits cleartext.

If you want a fully self-contained file with no network calls at all, download `index.html`, delete the `<link>` to Google Fonts, and accept the system-font fallback. Everything else is opt-in and silent until you turn it on.

## Non-goals

Keeping the scope narrow is still a feature. This project deliberately does **not** offer:
- **AI-generated reflections.** AI sharpens what you've already written — it never proposes content for empty fields, and never replaces your text without an explicit Accept.
- **Streaks, scores, weekly emails, or any gamification.** Progress in Sanskrit is invisible day-to-day; tracking it as a number distorts what's worth tracking.
- **Email/password or multi-provider auth.** Google sign-in only. If you don't want to sign in, guest mode is fully functional.
- **Recovery for lost passphrases.** The encryption is real encryption. A forgotten passphrase means inaccessible cloud data (your local copies are unaffected).
- **Cross-user sharing or collaborative reflection.** Single-user product.
- **Server-side AI processing.** You bring your own Anthropic key; we host no proxy and incur no token costs on your behalf.
- **Mobile-native apps.** The web app is mobile-first; there is no iOS/Android codebase.
- **Build tooling, frameworks, or bundlers.** SDKs load as ES modules from a CDN; the source remains readable end-to-end.

If you want any of these, fork it — the MIT license is built for exactly that.

## Adapting for other practices

The Gibbs Reflective Cycle is domain-general; this app's structure has nothing Sanskrit-specific about it beyond the visual styling, the Devanagari stage numerals, and the name. The default placeholders and AI prompts are domain-neutral, so it works as-is for language study (Sanskrit, Pali, Latin, Classical Greek, Biblical Hebrew, Classical Chinese, modern languages), music practice, mindfulness sits, professional-skill development, workouts, or post-mortems on a meeting or a hard conversation. Forks that lean further into a specific domain are welcome — the main places to customise are:
- The hero title and font imports (if you want a non-Devanagari aesthetic)
- The example placeholder text in the form
- The per-stage AI system prompts in `STAGE_CONFIG` if you want stage instructions tuned to your domain

## Credits

The reflective model is from Graham Gibbs' *Learning by Doing: A Guide to Teaching and Learning Methods* (Oxford Further Education Unit, 1988). The cycle is widely used in nursing, teaching, and professional development; this project adapts it for independent language study.

Epigraph from the Taittirīya Upaniṣad, Śikṣā Vallī: *svādhyāyān mā pramadaḥ* — "Do not neglect your own study."

## Contributing

This is a small tool maintained in spare time. Pull requests for bugs are welcome. Feature requests will mostly be closed with a friendly pointer to the Non-goals section above — not out of unwillingness, but because the tool's restraint is what makes it useful. Forks are encouraged.

## License

MIT — see [LICENSE](LICENSE).
