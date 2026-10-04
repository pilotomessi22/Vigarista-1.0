import { generateCryptographicKey } from '../src/utils/cryptoAuth';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
const db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);

async function run() {
  const days = parseInt(process.argv[2] || '30', 10);
  const key = generateCryptographicKey(days);
  const now = new Date().toISOString();
  const keyObj = {
    key: key.toUpperCase(),
    daysValid: days,
    createdAt: now,
    isRedeemed: false,
    status: 'active'
  };

  const keyDocRef = doc(db, 'license_keys', keyObj.key);
  await setDoc(keyDocRef, keyObj, { merge: true });

  console.log(JSON.stringify({
    success: true,
    key: keyObj.key,
    daysValid: days,
    createdAt: now
  }));

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
