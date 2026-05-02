#!/usr/bin/env bash
#
# check-ai-render.sh — repo-level guard for AI rendering and call-site discipline.
#
# Enforces, for every PR that touches AI-related code:
#   1. Every Anthropic API call goes through the shared `callAnthropic()` helper, with
#      `validateApiKey()` as the single documented exception (a 1-token auth probe).
#   2. No LLM-output render path uses `innerHTML`. AI output is rendered exclusively via
#      the `renderAiText()` helper, which uses `textContent` only.
#
# The script is invoked from PR descriptions: `bash scripts/check-ai-render.sh`
# Exit 0 = pass, exit 1 = fail.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
F="$ROOT/index.html"

if [ ! -f "$F" ]; then
  echo "FAIL: $F not found"
  exit 1
fi

fail=0

# 1. Anthropic API call sites — exactly two allowed:
#    - callAnthropic()   (the shared refinement helper)
#    - validateApiKey()  (the 1-token auth probe; NOT a refinement path)
N_CREATE=$(grep -cE 'messages\.create\(' "$F" || true)
if [ "$N_CREATE" -ne 2 ]; then
  echo "FAIL: expected exactly 2 'messages.create' call sites in index.html, found $N_CREATE"
  grep -nE 'messages\.create\(' "$F" || true
  echo "      Add new Anthropic call sites only via callAnthropic(); update this script if the"
  echo "      validateApiKey() exception count changes intentionally."
  fail=1
fi

# 2. Anthropic SDK constructor — same two sites.
N_CTOR=$(grep -c 'new Anthropic(' "$F" || true)
if [ "$N_CTOR" -ne 2 ]; then
  echo "FAIL: expected exactly 2 'new Anthropic(' constructors in index.html, found $N_CTOR"
  grep -n 'new Anthropic(' "$F" || true
  fail=1
fi

# 3. No innerHTML on AI-output paths. Heuristic: any line containing innerHTML AND any of
#    the AI-render keywords is a violation. Existing innerHTML on user-content render paths
#    (renderList, showDetail, empty-state) is allowed.
if grep -nE 'innerHTML.*(refine|sharpen|aiText|callRefine|renderAiText|propText|propBlock|tool_use)' "$F"; then
  echo "FAIL: innerHTML used on an AI-render path. Use textContent / renderAiText() instead."
  fail=1
fi
if grep -nE '(renderAiText|callRefine|tool_use|propText).*innerHTML' "$F"; then
  echo "FAIL: AI-render code references innerHTML. Use textContent / renderAiText() instead."
  fail=1
fi

# 4. The renderAiText helper itself must use textContent, not innerHTML.
if ! awk '/function renderAiText/,/^  }$/' "$F" | grep -q 'textContent'; then
  echo "FAIL: renderAiText() does not use textContent."
  fail=1
fi
if awk '/function renderAiText/,/^  }$/' "$F" | grep -q 'innerHTML'; then
  echo "FAIL: renderAiText() references innerHTML."
  fail=1
fi

# Informational: list every innerHTML line for human review on AI-touching PRs.
echo "INFO: All innerHTML usages in index.html (each must render user content only — never LLM output):"
grep -n 'innerHTML' "$F" || true

if [ $fail -eq 0 ]; then
  echo "OK: AI render guards pass."
fi
exit $fail
