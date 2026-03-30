/**
 * upsert-issue.mjs
 * Add or update a single issue document in Firestore (hub-3pmo / issues).
 *
 * Usage:
 *   node scripts/upsert-issue.mjs --file=./issue-data.json
 *
 * The JSON file should contain issue schema fields.
 * Optional: id (Firestore document ID). If provided, it merges. If not, it creates a new document.
 * Required if creating: project_slug, type, title.
 *
 * Service account: scripts/sa-hub-3pmo.json
 * Firestore project: hub-3pmo  |  Collection: issues
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const require    = createRequire(import.meta.url);

const SA_PATH = path.join(__dirname, 'sa-hub-3pmo.json');

// ── Parse args ───────────────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const fileArg = args.find(a => a.startsWith('--file='));
const filePath = fileArg ? fileArg.split('=').slice(1).join('=') : null;

if (!filePath) {
  console.error('Usage: node scripts/upsert-issue.mjs --file=./issue-data.json');
  process.exit(1);
}

const resolvedPath = path.resolve(filePath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`File not found: ${resolvedPath}`);
  process.exit(1);
}

// ── Load data ────────────────────────────────────────────────────────────────
const issueData = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));

const { id, ...fields } = issueData;

if (!id) {
  if (!fields.project_slug || !fields.type || !fields.title) {
    console.error('Error: new issues must include project_slug, type, and title');
    process.exit(1);
  }
}

// ── Connect ──────────────────────────────────────────────────────────────────
if (!fs.existsSync(SA_PATH)) {
  console.error(`Service account not found at ${SA_PATH}`);
  process.exit(1);
}

const serviceAccount = require(SA_PATH);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId:  'hub-3pmo',
});

const firestore = admin.firestore();

// ── Timestamps ───────────────────────────────────────────────────────────────
const now = admin.firestore.Timestamp.now();
const toTimestamp = (value) => {
  if (!value) return null;
  if (value === '__now__') return now;
  if (value && typeof value === 'object' && 'seconds' in value) return value;
  return admin.firestore.Timestamp.fromDate(new Date(value));
};

// Convert any date string fields to Timestamps
const dateFields = ['created_at', 'updated_at'];
const processed = { ...fields, updated_at: now };

for (const f of dateFields) {
  if (f in processed) {
    processed[f] = toTimestamp(processed[f]);
  }
}

let docRef;

if (id) {
  docRef = firestore.collection('issues').doc(id);
  // Do a get first to verify it exists if we aren't creating it from scratch
  const existing = await docRef.get();
  if (!existing.exists && !processed.created_at) {
     processed.created_at = now;
     console.log(`  → New document (provided ID) — setting created_at to now`);
  }
} else {
  docRef = firestore.collection('issues').doc();
  processed.created_at = processed.created_at || now;
  console.log(`  → New document (auto-generated ID: ${docRef.id})`);
}

// Provide sensible defaults for a new issue if not passed
if (!id || processed.created_at === now) {
  if (!processed.status) processed.status = 'Open';
  if (!processed.priority) processed.priority = 'P4';
  if (!processed.test_compile) processed.test_compile = '⬜';
  if (!processed.test_dod) processed.test_dod = '⬜';
  if (!processed.test_sit) processed.test_sit = '⬜';
  if (!processed.test_uat) processed.test_uat = '⬜';
  if (!processed.dod_items) processed.dod_items = [];
}

// ── Write ────────────────────────────────────────────────────────────────────
console.log(`\nUpserting issue: ${docRef.id}`);
console.log('Fields:', JSON.stringify(
  { ...processed, updated_at: '(now)', created_at: processed.created_at === now ? '(now)' : '(existing/timestamp)' },
  null, 2
));

await docRef.set(processed, { merge: true });

console.log(`\n✅ Issue "${docRef.id}" written to Firestore hub-3pmo/issues`);
