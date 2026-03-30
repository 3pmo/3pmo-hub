import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Load service account (using hardcoded path from context)
const saPath = 'C:\\Users\\willl\\My Drive\\AI\\_System\\firestore-service-account.json';
const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrate() {
  console.log("Starting migration...");
  const issuesCol = db.collection('issues');
  const snapshot = await issuesCol.get();

  if (snapshot.empty) {
    console.log("No issues found.");
    return;
  }

  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const update = {};

    // 1. Status Migration
    const oldStatus = data.status || 'Open';
    const statusMap = {
      'New': 'Open',
      'Open': 'Open',
      'In Progress': 'In Progress',
      'In Review': 'UAT',
      'Done': 'Done',
      'Closed': 'Done',
      'Parked': 'Parked'
    };
    update.status = statusMap[oldStatus] || 'Open';

    // 2. Testing Fields Migration
    // old: test_unit, test_sit, test_uat
    // new: test_compile, test_dod, test_sit, test_uat
    update.test_compile = data.test_unit || '⬜';
    update.test_dod = '⬜'; // Manual checklist now
    update.test_sit = data.test_sit || '⬜';
    update.test_uat = data.test_uat || '⬜';

    // Ensure we don't overwrite if they already exist (safety)
    // but this is a one-off migration so we usually overwrite.

    // 3. DoD Items Initialization
    if (!data.dod_items) {
      update.dod_items = [];
    }

    // 4. Cleanup old fields
    update.test_unit = admin.firestore.FieldValue.delete();

    batch.update(doc.ref, update);
    count++;
  });

  console.log(`Migrating ${count} documents...`);
  await batch.commit();
  console.log("Migration complete.");
}

migrate().catch(console.error);
