# CareNest on Firebase

The app now runs entirely on Firebase: **Authentication** (email/password, optional Google), **Cloud Firestore** (profiles, doctors, slots, appointments, notifications) and **Cloud Storage** (profile photos). Supabase is gone.

## 1. Install dependencies

```bash
npm install
```

The app's Firebase and Expo dependencies are declared in `package.json`. Firebase Admin SDK and emulator test tooling are dev dependencies; they are used by the catalogue seed script and Firestore rules tests, not bundled into the app.

## 2. Create the Firebase project

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Sign-in method** → enable **Email/Password** (and **Google** if you want it).
3. **Build → Firestore Database** → create (production mode). **Build → Storage** → get started (needs the Blaze plan on new projects).
4. **Project settings → Your apps → Web (`</>`)** → register an app and copy the config.
5. Copy `.env.example` to `.env`, fill in the six `EXPO_PUBLIC_FIREBASE_*` values, then restart with `npx expo start -c`.

## 3. Deploy the security rules (required)

The rules are what make the database safe: patients can only read their own data, and a slot can only be booked or released together with its appointment.

```bash
npx firebase login
npx firebase use --add            # pick your project
npx firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 4. Seed doctors and time slots

Service-account key: **Project settings → Service accounts → Generate new private key** (keep it out of git).

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\service-account.json"
node scripts/seed-firestore.mjs --project your-project-id        # add --dry-run to preview
```

Re-run it any time to extend the booking window; slots already booked are never overwritten. **The seed includes 15 sample doctor profiles across eight specialties; these are development/demo data. Replace them with real clinicians before launch.**

## 5. Optional: Google sign-in

Create OAuth client IDs (Web is required, plus iOS/Android as you ship) in Google Cloud Console for the same project, put them in `.env` (`EXPO_PUBLIC_GOOGLE_*`), and set a `scheme` in `app.json`. With no IDs set the button is hidden.

## Data model

| Path | Contents | Who can write |
|---|---|---|
| `users/{uid}` | patient profile | the patient (validated) |
| `owners/{uid}` | canonical owner/account record, keyed by Firebase UID | the matching patient (validated) |
| `users/{uid}/notifications/{id}` | in-app notifications | the patient |
| `specialties/{id}`, `doctors/{id}` | catalogue | seed script only |
| `doctors/{id}/slots/{slotId}` | bookable time slots | only as part of a booking or cancellation |
| `appointments/{id}` | bookings | the patient: create (with slot reservation) and cancel only |

### Migrate existing accounts

The app creates or updates `owners/{uid}` on sign-in and registration by combining Firebase Auth details, the existing `users/{uid}` patient profile, and same-UID owner data cached on the device. Deploy the updated Firestore rules before releasing the app:

```powershell
npx firebase deploy --only firestore:rules --project <firebase-project-id>
```

To backfill every existing Firebase Authentication account in one operation, sign in with `firebase login` or configure Application Default Credentials/a trusted service-account credential. Run a dry run before writing:

```powershell
# Firebase CLI login is sufficient; use the credential path instead if preferred.
firebase login
# Optional when using a service account:
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"
npm run migrate:owners -- --project <firebase-project-id> --dry-run
npm run migrate:owners -- --project <firebase-project-id>
```

The migration is safe to rerun; it preserves existing owner-only values when the profile has no corresponding value.

## Tests

```powershell
npm test
npx firebase emulators:exec --only firestore --project demo-carenest "node --test tests/firestore.rules.test.mjs"
```

## Troubleshooting

- **"Component auth has not been registered yet"** (Metro resolving the wrong Firebase build): create `metro.config.js`:
  ```js
  const { getDefaultConfig } = require("expo/metro-config");
  const config = getDefaultConfig(__dirname);
  config.resolver.sourceExts.push("cjs");
  config.resolver.unstable_enablePackageExports = false;
  module.exports = config;
  ```
- **"permission-denied" on everything**: the rules aren't deployed to this project (step 3), or you're signed out.
- **No doctors appear**: the seed script hasn't run against this project (step 4).

## Before you submit to the App Store / Play Store

- **Legal review** of `app/account/privacy-policy.tsx` (it's a template) and a terms-of-service screen. The app stores health information.
- **In-account deletion.** Both stores require it for apps that create accounts. Not built yet (the rules currently forbid deleting a profile).
- **Real clinicians, real fees**, and a decision on how video-call visits actually work (the app only records the preference; the clinic is told to contact the patient).
- No payments: fees are shown and paid at the clinic. No push notifications or clinician-side app yet; appointments are marked "completed" automatically once their end time passes.
- Restrict the Firebase API key to your app bundle IDs, and consider enabling App Check.
