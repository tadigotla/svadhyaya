# Deployment Guide

Quick steps to get `svadhyaya` live on GitHub Pages.

## 1. Create the repo

On GitHub, create a new public repository. Suggested name: **`svadhyaya`** (or whatever you pick — just update the README link accordingly).

Do **not** initialize it with a README; you already have one.

## 2. Upload the files

The four files in this bundle go in the root of the repo:

```
svadhyaya/
├── index.html      ← the app (renamed from sanskrit-reflection.html)
├── README.md
├── LICENSE
└── DEPLOY.md       ← this file; optional, you can delete it after setup
```

Either drag-and-drop through the GitHub web interface ("Add file → Upload files"), or clone locally and push:

```bash
git clone https://github.com/tadigotla/svadhyaya.git
cd svadhyaya
# copy the four files in
git add .
git commit -m "Initial release"
git push
```

## 3. Edit the placeholders

Before pushing, open `README.md` and replace:
- `tadigotla` in the GitHub Pages URL (appears twice, near the top)

Open `LICENSE` and replace:
- `[Your Name]` on the copyright line

## 4. Enable GitHub Pages

In the repo on GitHub: **Settings → Pages**.

- **Source:** Deploy from a branch
- **Branch:** `main` (or `master`), folder `/ (root)`
- Click **Save**

Within a minute or two, the site will be live at:

```
https://tadigotla.github.io/svadhyaya/
```

## 5. Verify

Visit the URL. The journal should load. Create a test reflection, refresh the page, and confirm it persists. Try the JSON export.

## 6. Share it

A few places where Sanskrit learners gather and might appreciate this:
- **r/sanskrit** on Reddit
- **r/languagelearning** on Reddit (with the adaptation angle)
- **Hacker News** Show HN (if you want broader visibility — the reflective-cycle framing is the hook)
- Sanskrit Discord servers and forums
- Twitter/Mastodon with a screenshot

Lead with *why* it exists, not *what* it is — the story about structured reflection is more interesting than the feature list.

## Firebase setup (Phase 4 — cloud sync)

Cloud sync is opt-in. Guest mode never touches Firebase, so this section is only required
once Phase 4 ships. Phases 1–3 (mobile redesign, BYOK AI, voice capture) work without
any of the steps below.

### Console steps (must be done in the Firebase console)

1. **Create the project.** Go to <https://console.firebase.google.com>, click *Add
   project*, name it `svadhyaya` (or anything you like), accept the analytics / TOS
   prompts. Note the **Project ID** that gets generated — you'll need it later.

2. **Enable Authentication.**
   - Sidebar → *Build* → *Authentication* → *Get started*
   - *Sign-in method* tab → *Add new provider* → **Google**
   - Toggle *Enable*, set the project's public-facing name and a support email,
     click *Save*

3. **Enable Firestore.**
   - Sidebar → *Build* → *Firestore Database* → *Create database*
   - **Native mode** (not Datastore mode)
   - Choose a location close to your users (e.g., `nam5` or `eur3`); this can't be
     changed later
   - Start in *production mode* — security rules deny everything until we deploy ours

4. **Add your web app.**
   - Project Overview → *Add app* → web (the `</>` icon)
   - Nickname: `svadhyaya-web`. **Do not** enable Firebase Hosting (we use GitHub Pages)
   - Copy the `firebaseConfig` object that appears. You'll paste it into `index.html`
     when Phase 4 lands. The full block looks like:
     ```js
     const firebaseConfig = {
       apiKey: "AIza...",
       authDomain: "svadhyaya-xxxx.firebaseapp.com",
       projectId: "svadhyaya-xxxx",
       storageBucket: "svadhyaya-xxxx.appspot.com",
       messagingSenderId: "...",
       appId: "1:..."
     };
     ```
   This config is **not a secret** — security is enforced by the Firestore rules and
   Auth, not by hiding the config. It's safe to commit.

5. **Authorize your GitHub Pages domain.** Authentication → *Settings* → *Authorized
   domains* → *Add domain* → `tadigotla.github.io` (or your custom domain). Without
   this, Google sign-in will fail with a redirect error in production.

6. **Set a budget alert.** *Project settings* → *Usage and billing* → *Details &
   settings* → *Modify budget*. Set a $10/month budget on the project. This will email
   you if Firestore traffic ever spikes.

### Local steps (in this repo)

1. **Install the Firebase CLI** (one-time, globally):
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Link the local repo to your project.** From the repo root:
   ```bash
   firebase use --add
   # pick the project you created in step 1; alias it as "default"
   ```

3. **Deploy the security rules** (once you've created the Firebase project and pulled
   this repo's `firestore.rules`):
   ```bash
   firebase deploy --only firestore:rules
   ```
   Re-run this any time `firestore.rules` changes.

4. **Run the rules-test suite before deploying any rules change.** This is required by
   the cloud-sync spec (task 5.2a). From the repo root:
   ```bash
   # Terminal 1 — start the emulator
   firebase emulators:start --only firestore,auth --project svadhyaya-rules-test

   # Terminal 2 — run the tests
   cd tests
   npm install     # one-time
   npm run test:rules
   ```
   The tests assert that user A cannot read or write user B's entries, that
   unauthenticated requests are denied, and that the per-user namespace works as
   intended.

### When Phase 4 lands

Once Phase 4 ships, you'll paste the `firebaseConfig` object into `index.html` under a
clearly-marked section, and the app will start offering Google sign-in. Until then,
the rules / emulator / tests are sitting here, ready, but the app does not import
Firebase at runtime — so the steps above can wait.

## Optional polish

- **Add a screenshot** to the README. GitHub renders the first image you reference, so make it a good one. Name it `screenshot.png` and reference it near the top: `![Svādhyāya journal](screenshot.png)`.
- **Custom domain.** If you own a domain, you can point it at GitHub Pages (Settings → Pages → Custom domain).
- **Topics.** On the repo's main page, click the gear next to "About" and add topics: `sanskrit`, `language-learning`, `journal`, `reflective-practice`, `gibbs-cycle`. Helps discovery.
- **A one-line repo description** next to the topics: *"A structured reflection journal for Sanskrit learners, built around Gibbs' Reflective Cycle."*

That's it. You can delete this file after setup if you don't want it in the repo.
