// Svādhyāya — Firestore security rules test suite
//
// Covers the three guarantees called out in tasks.md task 5.2a:
//   (a) authenticated user A cannot read or write any document under users/{B}/...
//   (b) unauthenticated reads/writes are denied
//   (c) authenticated user A can read and write their own users/{A}/entries/{id} documents
//
// Plus a fourth check that paths outside /users/** are denied to everyone.
//
// Prerequisites:
//   - Firebase CLI installed (npm i -g firebase-tools)
//   - Emulator running: from repo root, `firebase emulators:start --only firestore,auth --project svadhyaya-rules-test`
//     (or `npm run emulators` from this tests/ directory)
//   - From this tests/ directory: `npm install` then `npm run test:rules`

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const HERE = dirname(fileURLToPath(import.meta.url));
const RULES_PATH = resolve(HERE, '..', 'firestore.rules');

const PROJECT_ID = 'svadhyaya-rules-test';

const sampleEntry = () => ({
  id: 'r_smoke',
  schemaVersion: 1,
  provenance: 'local',
  ivByField: { description: 'aGVsbG9pdg==' },
  ciphertextByField: { description: 'Y2lwaGVydGV4dA==' },
  durationMinutes: 30,
  dateOnly: '2026-01-01',
  createdAt: 1735689600000,
  updatedAt: 1735689600000,
});

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(RULES_PATH, 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  if (testEnv) await testEnv.cleanup();
});

beforeEach(async () => {
  if (testEnv) await testEnv.clearFirestore();
});

describe('Firestore security rules — per-user isolation', () => {
  it('(c) authenticated user A can write and read their own entries', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const refAlice = doc(alice.firestore(), 'users/alice/entries/r_smoke');
    await assertSucceeds(setDoc(refAlice, sampleEntry()));
    await assertSucceeds(getDoc(refAlice));
  });

  it('(a) authenticated user A cannot read user B entries', async () => {
    // Seed bob's entry via security-rules bypass (the only legitimate way for tests).
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users/bob/entries/r_owned'), sampleEntry());
    });
    const alice = testEnv.authenticatedContext('alice');
    const refBob = doc(alice.firestore(), 'users/bob/entries/r_owned');
    await assertFails(getDoc(refBob));
  });

  it('(a) authenticated user A cannot write to user B entries', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const refBob = doc(alice.firestore(), 'users/bob/entries/r_overwrite');
    await assertFails(setDoc(refBob, sampleEntry()));
  });

  it('(a) authenticated user A cannot read user B documents under any subpath', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users/bob/preferences/main'), { theme: 'dark' });
    });
    const alice = testEnv.authenticatedContext('alice');
    const refBobPrefs = doc(alice.firestore(), 'users/bob/preferences/main');
    await assertFails(getDoc(refBobPrefs));
  });

  it('(b) unauthenticated reads of any user entries are denied', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users/alice/entries/r_world_read'), sampleEntry());
    });
    const guest = testEnv.unauthenticatedContext();
    await assertFails(getDoc(doc(guest.firestore(), 'users/alice/entries/r_world_read')));
  });

  it('(b) unauthenticated writes are denied', async () => {
    const guest = testEnv.unauthenticatedContext();
    await assertFails(
      setDoc(doc(guest.firestore(), 'users/alice/entries/r_unauthed_write'), sampleEntry())
    );
  });

  it('paths outside /users/** are denied for authenticated users', async () => {
    const alice = testEnv.authenticatedContext('alice');
    await assertFails(setDoc(doc(alice.firestore(), 'admin/global'), { x: 1 }));
    await assertFails(getDoc(doc(alice.firestore(), 'admin/global')));
  });

  it('paths outside /users/** are denied for unauthenticated users', async () => {
    const guest = testEnv.unauthenticatedContext();
    await assertFails(setDoc(doc(guest.firestore(), 'public/something'), { x: 1 }));
    await assertFails(getDoc(doc(guest.firestore(), 'public/something')));
  });
});
