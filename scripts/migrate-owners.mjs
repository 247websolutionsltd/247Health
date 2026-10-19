#!/usr/bin/env node
// Backfills owners/{uid} from Firebase Auth and existing users/{uid} profile documents.
//
//   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\service-account.json"
//   node scripts/migrate-owners.mjs --project <firebase-project-id> --dry-run
//   node scripts/migrate-owners.mjs --project <firebase-project-id>
//
// Safe to re-run: existing owner-only fields and createdAt are retained where the source
// patient profile has no value; current Auth/profile values refresh the migrated fields.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const value = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const projectId = value("project", process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
if (!projectId) throw new Error("Pass --project <firebase-project-id> (or set EXPO_PUBLIC_FIREBASE_PROJECT_ID).");
const usingEmulators = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST);
if (
  (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) &&
  !usingEmulators
) {
  throw new Error("Configure both Firebase Auth and Firestore emulators before migrating owners.");
}

const { applicationDefault, initializeApp } = await import("firebase-admin/app");
const { Timestamp } = await import("firebase-admin/firestore");
const useCliRest = !usingEmulators && !process.env.GOOGLE_APPLICATION_CREDENTIALS;
let adminAuth;
let db;
let writer;
let cliAuth;
let cliRefreshToken;

if (useCliRest) {
  cliAuth = require("firebase-tools/lib/auth");
  const account = cliAuth.getGlobalDefaultAccount();
  cliRefreshToken = account?.tokens?.refresh_token;
  if (!cliRefreshToken) {
    throw new Error("No Firebase CLI login or Application Default Credentials found. Run `firebase login` or configure GOOGLE_APPLICATION_CREDENTIALS.");
  }
} else {
  initializeApp({
    projectId,
    ...(usingEmulators ? {} : { credential: applicationDefault() }),
  });
  const { getAuth } = await import("firebase-admin/auth");
  const { getFirestore } = await import("firebase-admin/firestore");
  adminAuth = getAuth();
  db = getFirestore();
}

async function cliAccessToken() {
  const token = await cliAuth.getAccessToken(cliRefreshToken, []);
  return token.access_token;
}

const apiBase = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents`;

async function cliRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${await cliAccessToken()}`,
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`Firebase REST request failed (${response.status}): ${body.error?.message ?? response.statusText}`);
  }
  return response.status === 204 ? null : response.json();
}

function decodeFirestoreValue(value) {
  if ("stringValue" in value) return value.stringValue;
  if ("timestampValue" in value) return new Date(value.timestampValue);
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  return null;
}

function encodeFirestoreValue(value) {
  if (value === null) return { nullValue: "NULL_VALUE" };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return { doubleValue: value };
  return { stringValue: String(value) };
}

function decodeFirestoreDocument(document) {
  return Object.fromEntries(
    Object.entries(document?.fields ?? {}).map(([key, value]) => [key, decodeFirestoreValue(value)]),
  );
}

async function readFirestoreDocument(collectionName, uid) {
  const url = `${apiBase}/${collectionName}/${encodeURIComponent(uid)}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${await cliAccessToken()}` } });
  if (response.status === 404) return null;
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`Could not read ${collectionName}/${uid} (${response.status}): ${body.error?.message ?? response.statusText}`);
  }
  return decodeFirestoreDocument(await response.json());
}

async function writeOwnerDocument(uid, data) {
  const url = new URL(`${apiBase}/owners/${encodeURIComponent(uid)}`);
  for (const key of Object.keys(data)) url.searchParams.append("updateMask.fieldPaths", key);
  const fields = Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, encodeFirestoreValue(value)]),
  );
  await cliRequest(url, { method: "PATCH", body: JSON.stringify({ fields }) });
}

const dryRun = flag("dry-run");
if (!dryRun && !useCliRest) writer = db.bulkWriter();

let scanned = 0;
let migrated = 0;
let created = 0;
let updated = 0;
let nextPageToken;
const text = (value) => typeof value === "string" && value.trim() ? value.trim() : null;

do {
  const page = useCliRest
    ? await cliRequest(
        `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:batchGet?${new URLSearchParams({
          maxResults: "1000",
          ...(nextPageToken ? { nextPageToken } : {}),
        })}`,
      )
    : await adminAuth.listUsers(1000, nextPageToken);
  nextPageToken = useCliRest ? page.nextPageToken : page.pageToken;
  const authUsers = useCliRest ? (page.users ?? []).map((user) => ({
    uid: user.localId,
    email: user.email,
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
    photoURL: user.photoUrl,
  })) : page.users;

  for (const authUser of authUsers) {
    const [profileData, existingOwner] = useCliRest
      ? await Promise.all([
          readFirestoreDocument("users", authUser.uid),
          readFirestoreDocument("owners", authUser.uid),
        ])
      : await Promise.all([
          db.collection("users").doc(authUser.uid).get().then((snapshot) => snapshot.exists ? snapshot.data() : null),
          db.collection("owners").doc(authUser.uid).get().then((snapshot) => snapshot.exists ? snapshot.data() : null),
        ]);
    const profile = profileData ?? {};
    const existing = existingOwner ?? {};

    const owner = {
      uid: authUser.uid,
      email: text(authUser.email) ?? text(existing.email),
      displayName:
        text(profile.full_name) ||
        text(authUser.displayName) ||
        text(existing.displayName) ||
        text(authUser.email)?.split("@")[0] ||
        "Patient",
      phone: text(profile.phone) ?? text(authUser.phoneNumber) ?? text(existing.phone),
      photoURL: text(authUser.photoURL) ?? text(existing.photoURL),
      bloodType: text(profile.blood_type) ?? text(existing.bloodType),
      allergies: text(profile.allergies) ?? text(existing.allergies),
      createdAt: existing.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    scanned++;
    if (existingOwner) updated++;
    else created++;
    if (!dryRun) {
      if (useCliRest) {
        await writeOwnerDocument(authUser.uid, owner);
      } else {
        writer.set(db.collection("owners").doc(authUser.uid), {
          ...owner,
          createdAt: existing.createdAt ?? Timestamp.now(),
          updatedAt: Timestamp.now(),
        }, { merge: true });
      }
      migrated++;
    }
  }
} while (nextPageToken);

if (writer) await writer.close();
console.log(
  dryRun
    ? `Dry run complete. Auth accounts scanned: ${scanned}; owner records to create: ${created}; to update: ${updated}; no records changed.`
    : `Migration complete. Auth accounts scanned: ${scanned}; owner records created: ${created}; updated: ${updated}; writes submitted: ${migrated}.`,
);
