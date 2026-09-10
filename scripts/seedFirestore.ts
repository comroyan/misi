import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfigRaw from '../firebase-applet-config.json';
import {
  INITIAL_MISSIONS,
  INITIAL_CATEGORIES,
  INITIAL_BANNERS,
  INITIAL_SETTINGS,
} from '../src/data/seed';

const app = !getApps().length
  ? initializeApp({
      apiKey: firebaseConfigRaw.apiKey,
      authDomain: firebaseConfigRaw.authDomain,
      projectId: firebaseConfigRaw.projectId,
      storageBucket: firebaseConfigRaw.storageBucket,
      messagingSenderId: firebaseConfigRaw.messagingSenderId,
      appId: firebaseConfigRaw.appId,
    })
  : getApps()[0];

const db = getFirestore(app, firebaseConfigRaw.firestoreDatabaseId || '(default)');

async function seed() {
  console.log('Seeding Firestore database:', firebaseConfigRaw.firestoreDatabaseId);

  // 1. Seed Categories
  for (const cat of INITIAL_CATEGORIES) {
    await setDoc(doc(db, 'missionCategories', cat.id), cat);
    console.log('Seeded category:', cat.name);
  }

  // 2. Seed Banners
  for (const banner of INITIAL_BANNERS) {
    await setDoc(doc(db, 'banners', banner.id), banner);
    console.log('Seeded banner:', banner.title);
  }

  // 3. Seed Platform Settings
  await setDoc(doc(db, 'settings', 'general'), INITIAL_SETTINGS);
  console.log('Seeded platform settings');

  // 4. Seed Admin Auth
  await setDoc(doc(db, 'settings', 'admin_auth'), {
    email: 'admin@misiku.id',
    password: 'admin123456',
    updatedAt: new Date().toISOString(),
  });
  console.log('Seeded admin auth');

  // 5. Seed Missions
  for (const m of INITIAL_MISSIONS) {
    await setDoc(doc(db, 'missions', m.id), m);
    console.log('Seeded mission:', m.title);
  }

  console.log('✅ Firestore Database Seeding Completed Successfully!');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
