# 247Health

247Health is an Expo app for finding doctors, booking appointments, and managing patient profiles. Firebase Authentication, Cloud Firestore, and Cloud Storage provide the backend.

## Get started

1. Install dependencies and create a local environment file:

   ```powershell
   npm install
   Copy-Item .env.example .env
   ```

2. Fill in the Firebase web-app values in `.env`. See [Firebase setup](./FIREBASE_SETUP.md) for project configuration, security rules, catalogue seeding, and troubleshooting.

3. Start the app:

   ```bash
   npx expo start -c
   ```

The app uses [Expo Router](https://docs.expo.dev/router/introduction) for file-based navigation. Run `npm run lint` to check the source and `npx tsc --noEmit` to type-check it.
