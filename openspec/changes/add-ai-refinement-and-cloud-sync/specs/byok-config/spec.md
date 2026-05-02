## ADDED Requirements

### Requirement: Settings UI for entering an Anthropic API key

The system SHALL provide a Settings panel that allows the user to enter, update, and remove their Anthropic API key. The Settings panel MUST be reachable from the main reflection form.

#### Scenario: User opens Settings and enters a key

- **WHEN** the user opens Settings and pastes a key into the API key input
- **THEN** the system stores the key locally and validates it against the Anthropic API

#### Scenario: User removes their API key

- **WHEN** the user taps "Remove key" in Settings
- **THEN** the key is deleted from local storage
- **AND** all AI affordances are hidden on the next render

### Requirement: API key stored locally only

The system MUST store the Anthropic API key only in browser-local persistence (`localStorage` or IndexedDB) and MUST NOT transmit the key to any service other than the Anthropic API itself. The key MUST NEVER be written to Firestore or any other cloud-synced location.

#### Scenario: User signs in and syncs reflections

- **WHEN** the signed-in user's reflections are written to Firestore
- **THEN** the Anthropic API key is not included in any Firestore document

#### Scenario: User signs in on a second device

- **WHEN** the user signs in on a new device for the first time
- **THEN** their reflections sync down (after passphrase entry)
- **AND** the Anthropic API key does not sync; the user must re-enter it on the new device for AI features

### Requirement: Key validation on entry

The system MUST validate a newly-entered API key by making a low-cost Anthropic API call (e.g., a 1-token completion) before persisting the key. The system MUST surface a clear error if validation fails.

#### Scenario: User enters an invalid key

- **WHEN** the user enters a string that the Anthropic API rejects with a 401 or 403
- **THEN** the system shows "This API key was rejected by Anthropic" and does not persist the key

#### Scenario: User enters a valid key

- **WHEN** the user enters a key and the validation call succeeds
- **THEN** the system persists the key
- **AND** AI affordances become visible

### Requirement: User-facing security disclosure

The Settings panel MUST display a brief, plain-language disclosure that the API key is stored in the browser, that the user pays Anthropic directly, and that the key should not be entered on a device the user does not trust.

#### Scenario: User opens Settings for the first time

- **WHEN** the user opens Settings without a key configured
- **THEN** the disclosure text is visible above the API key input

### Requirement: Key never logged or rendered in DOM beyond the Settings input

The system MUST NOT log the API key to console, MUST NOT include it in error messages, and MUST NOT render it in any DOM element except the Settings input field. The Settings input field MUST default to a masked display (e.g., `password` input type) with an explicit "Show" toggle.

#### Scenario: An AI call fails and the system shows an error

- **WHEN** an Anthropic API call fails for any reason
- **THEN** the user-facing error message does not contain the API key

### Requirement: Per-call usage of the configured key

The system MUST attach the configured API key to every Anthropic API request via the SDK's standard mechanism. The system MUST NOT cache the key in JavaScript module scope longer than needed for the request.

#### Scenario: User taps Sharpen on a reflection field

- **WHEN** the user has a configured key and taps an AI affordance
- **THEN** the system reads the key from local storage at request time
- **AND** uses it to authenticate the Anthropic API call
