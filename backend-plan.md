# Firebase Backend

The app uses Firebase Authentication for patient identity, Cloud Firestore for profiles, catalogue data, appointments, and notifications, and Cloud Storage for profile photos.

Firestore and Storage access rules are maintained in [`firebase/firestore.rules`](./firebase/firestore.rules) and [`firebase/storage.rules`](./firebase/storage.rules). The rules enforce patient ownership and require booking or cancellation writes to update the appointment and slot atomically.

For Firebase project setup, environment variables, catalogue seeding, emulator tests, and troubleshooting, see [`FIREBASE_SETUP.md`](./FIREBASE_SETUP.md).
