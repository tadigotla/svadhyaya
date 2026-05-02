## Why

The `ai-refinement` capability shipping in `add-ai-refinement-and-cloud-sync` treats the per-stage system prompt as hidden infrastructure. The user taps "Tidy timeline," an opaque Anthropic call happens, and the result appears in an accept/reject panel. This is fast, but it works against svādhyāya's transparency ethos: the user can't see what the LLM was instructed to do on their behalf, can't tune that instruction for their domain (a meditator's "tidy timeline" reads differently from a coder's), and can't iterate when the output misses the mark.

This change makes the stage instruction visible, editable, and re-runnable inline. The structural-separation preamble (the prompt-injection defense) and the tool-use directive remain locked: not visible, not editable, always sent. Only the per-stage *instruction sentence* is exposed for the user to inspect or tune before tapping Retry.

## What Changes

- Replace the inline accept/reject panel with an editable-prompt inline panel beneath each stage textarea.
- Stage button labels stay stage-specific ("Tidy timeline," "Ask me one question," etc.) — the cognitive cue is preserved.
- LLM call fires on panel open using the stage's default instruction.
- The editable instruction textarea inside the panel is the only user-editable surface; the locked preamble + tool schema are not shown.
- "Retry" re-runs the call using the current (possibly edited) instruction; only the most recent answer is displayed.
- "Reject" disappears as an explicit button — closing the panel is implicit reject.
- Accept semantics:
  - For `refined_text` stages (Description, Evaluation, Conclusion, Action Plan): replace the stage textarea contents (unchanged from today).
  - For `question` stages (Feelings, Analysis): append `\n\n→ <question>` to the stage textarea, so the user writes their answer beneath it.
- BREAKING (within `ai-refinement` capability): the *Accept/reject UX* requirement is replaced by *Accept/Retry UX*; scenarios mentioning an explicit "Reject" button are revised.

## Capabilities

### Modified Capabilities

- `ai-refinement`: per-stage affordances open an editable-prompt panel; accept/reject UX becomes accept/retry; new requirements lock the preamble outside user reach and require an LLM call on panel open.

### New Capabilities

None.

## Impact

- **Code**: `index.html` — refinement panel rewrites. The stage-prompt object literal becomes the source of *defaults* loaded into the panel's instruction textarea, not a fixed value sent on every call. `buildSystemPrompt` gains an `instruction` parameter; all callers updated.
- **Dependencies**: none new. No new SDK imports.
- **Privacy / security**: unchanged. Every Anthropic call still includes the locked structural-separation preamble and tool-schema constraint. The user's instruction is concatenated *after* the preamble; it never templates into it.
- **Existing users**: panel UX changes; no data shape changes; no migration required.
- **Sequencing**: lands after `add-ai-refinement-and-cloud-sync` ships (Phase 6 release). Not folded into that change because it would invalidate completed tasks (3.7, 3.9) and confuse what shipped vs. what changed.
- **Out of scope**: persisting user-edited instructions across sessions, multi-attempt history, BYOK-stored prompt overrides, cross-stage prompt presets.
