## ADDED Requirements

### Requirement: Google sign-in via Firebase Auth

The system SHALL support sign-in with Google as the only authentication method. The system MUST NOT prompt for email/password, magic links, or any other auth method.

#### Scenario: First-time user signs in

- **WHEN** a user taps "Sign in with Google" and completes the OAuth flow
- **THEN** the system establishes a Firebase Auth session for that user
- **AND** the user's Firebase UID is used as the per-user namespace for all subsequent Firestore operations

#### Scenario: User signs out

- **WHEN** the user taps "Sign out"
- **THEN** the system terminates the Firebase Auth session
- **AND** the cached encryption key for that user is cleared from IndexedDB

### Requirement: Guest mode preserved

The system MUST allow full use of the journal without sign-in. In guest mode the system MUST NOT make any network request to Firebase services and MUST persist all data to localStorage only.

#### Scenario: User opens the app and never signs in

- **WHEN** the user creates, edits, and saves reflections without signing in
- **THEN** all data is stored in `localStorage` and no Firebase network request is made

### Requirement: Per-user encryption passphrase

The system MUST require the user to set a passphrase on first sign-in and to enter that passphrase on each new device. The system MUST derive a per-user master key from the passphrase using PBKDF2 with at least 310,000 iterations and SHA-256, salted with the user's Firebase UID.

#### Scenario: First sign-in on a new device

- **WHEN** a signed-in user has no cached master key on this device
- **THEN** the system prompts for the passphrase
- **AND** does not read or write any Firestore reflection content until the passphrase has been entered and the derived key has been verified

#### Scenario: Returning user on the same device

- **WHEN** a signed-in user with a cached master key in IndexedDB returns
- **THEN** the system uses the cached key without prompting for the passphrase

### Requirement: Reflection content encrypted at rest in Firestore

The system MUST encrypt every reflection-content field with AES-GCM-256 before writing to Firestore. The system MUST decrypt fields client-side before display. Plaintext reflection content MUST NOT be written to Firestore under any code path.

#### Scenario: User saves a new reflection while signed in

- **WHEN** the signed-in user submits a reflection
- **THEN** the system generates a fresh 96-bit IV
- **AND** encrypts each of the six Gibbs-stage fields and the topic field with AES-GCM-256 using the master key and the IV
- **AND** writes the ciphertext, IV, and metadata (entry id, created-at timestamp, schema version, provenance) to Firestore

#### Scenario: User loads the archive

- **WHEN** the signed-in user opens the archive view
- **THEN** the system reads ciphertext from Firestore and decrypts it client-side using the cached master key
- **AND** displays the decrypted plaintext

### Requirement: Encryption smoke test on load

The system MUST perform an encrypt-then-decrypt round-trip of a known string after deriving the master key and before reading any user data. Failure to round-trip MUST surface a passphrase-mismatch error.

#### Scenario: User enters an incorrect passphrase

- **WHEN** the user enters a passphrase that does not match the one used to encrypt their existing data
- **THEN** the smoke test fails decryption
- **AND** the system shows "Passphrase does not match the one used to encrypt your reflections" and does not load any cloud data

### Requirement: Optimistic local writes with offline queue

The system MUST persist every save to localStorage immediately and synchronously. When signed in, the system MUST queue Firestore writes and replay them when the network is available.

#### Scenario: User saves a reflection while offline

- **WHEN** a signed-in user saves a reflection with no network connectivity
- **THEN** the reflection is persisted to localStorage immediately
- **AND** the Firestore write is queued and retried when connectivity returns

### Requirement: One-time migration prompt for existing localStorage data

The system MUST detect existing localStorage entries on first sign-in and MUST present a one-time prompt asking whether to migrate them to Firestore. The system MUST NOT migrate without explicit user consent.

#### Scenario: User signs in for the first time with N existing local reflections

- **WHEN** the user completes sign-in and a master key has been established
- **THEN** the system shows a prompt: "You have N reflections stored locally. Move them to encrypted cloud storage?"
- **AND** if the user accepts, each entry is encrypted and written to Firestore
- **AND** if the user declines, no Firestore write occurs and the prompt is not shown again

### Requirement: Local data is preserved after migration

The system MUST retain localStorage copies of migrated entries after a successful migration. The system MUST NOT auto-delete local data.

#### Scenario: Migration completes successfully

- **WHEN** the user has migrated their entries to Firestore
- **THEN** the localStorage entries are still present
- **AND** the cloud is treated as primary going forward

### Requirement: Firestore security rules enforce per-user isolation

The system's Firestore security rules MUST allow each authenticated user to read and write only their own entries (under their UID). The rules MUST deny all other access.

#### Scenario: Signed-in user A attempts to read user B's entries

- **WHEN** user A's client constructs a Firestore query for user B's entries
- **THEN** Firestore rejects the request via security rules

### Requirement: JSON export of decrypted data remains available

Signed-in users MUST be able to export their reflections as a plaintext JSON file via the existing Backup tab. The export MUST contain the decrypted content (the user's own data).

#### Scenario: Signed-in user exports a JSON backup

- **WHEN** the signed-in user taps "Export JSON"
- **THEN** the system reads ciphertext from Firestore, decrypts client-side, and produces a JSON file containing the plaintext reflections
- **AND** no plaintext is written to Firestore at any point during this flow
