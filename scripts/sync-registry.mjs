/**
 * sync-registry.mjs
 * Syncs the project registry from Firestore (hub-3pmo / projects collection)
 * to src/assets/projects.json for use by the StatusTab UI.
 *
 * Replaces the old approach of parsing project-registry.md (archived 2026-03-28).
 *
 * Usage (runs automatically via npm run dev / npm run build):
 *   node scripts/sync-registry.mjs
 *
 * Service account: scripts/sa-hub-3pmo.json
 * Firestore project: hub-3pmo  |  Collection: projects
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const require    = createRequire(import.meta.url);

const OUTPUT_PATH  = path.join(__dirname, '../src/assets/projects.json');
const META_PATH    = path.join(__dirname, '../src/assets/sync-meta.json');
const SA_PATH      = path.join(__dirname, 'sa-hub-3pmo.json');

// ── CI guard ────────────────────────────────────────────────────────────────
if (process.env.CI) {
  console.log('CI environment detected — skipping registry sync (using existing src/assets/projects.json)');
  process.exit(0);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a Firestore Timestamp (or ISO string) to a YYYY-MM-DD string. */
function toDateStr(value) {
  if (!value) return null;
  // Firestore Admin SDK returns Timestamp objects with a .toDate() method
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString().slice(0, 10);
  }
  // Fallback: already a string
  return String(value).slice(0, 10);
}

/** Map a Firestore project document to the shape expected by StatusTab. */
function mapProject(doc) {
  const d = doc.data();

  // Backlog string: "🐛 0 Bugs | 🚀 1 Enhancement"
  const bugs = d.backlog_bugs ?? 0;
  const enh  = d.backlog_enhancements ?? 0;
  const backlog = `🐛 ${bugs} Bug${bugs !== 1 ? 's' : ''} | 🚀 ${enh} Enhancement${enh !== 1 ? 's' : ''}`;

  return {
    name:        d.name        ?? doc.id,
    status:      d.status      ?? null,
    description: d.description ?? null,
    current_ai:  d.current_ai  ?? null,
    last_active: toDateStr(d.last_active),
    github:      d.github_repo  ?? null,
    drive:       d.drive_path  ?? null,
    local:       d.local_path  ?? null,
    deploy:      d.deploy_method ?? null,
    backlog,
    active_item: d.notes       ?? null,
    parent_project_id: d.parent_project_id ?? null,
    tags:        d.tags        ?? [],
    category:    d.category    ?? null,
  };
}

/** Sort order: standing → active → tabs, then alphabetically within each group. */
function sortProjects(projects) {
  const order = { standing: 0, active: 1, tab: 2 };
  return [...projects].sort((a, b) => {
    const ao = order[a.category] ?? 9;
    const bo = order[b.category] ?? 9;
    if (ao !== bo) return ao - bo;
    return (a.name ?? '').localeCompare(b.name ?? '');
  });
}

// ── Main ────────────────────────────────────────────────────────────────────

console.log('Syncing project registry from Firestore...');

try {
  // Verify service account exists
  if (!fs.existsSync(SA_PATH)) {
    throw new Error(`Service account not found at ${SA_PATH}`);
  }

  const serviceAccount = require(SA_PATH);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId:  'hub-3pmo',
  });

  const firestore = admin.firestore();
  const snapshot  = await firestore.collection('projects').get();

  if (snapshot.empty) {
    console.warn('⚠️  Firestore returned 0 documents — writing empty projects.json');
    fs.writeFileSync(OUTPUT_PATH, '[]');
  } else {
    const projects = sortProjects(snapshot.docs.map(mapProject));

    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(projects, null, 2));
    console.log(`✅ Synced ${projects.length} projects from Firestore to src/assets/projects.json`);
  }

  fs.writeFileSync(META_PATH, JSON.stringify({ last_sync: new Date().toISOString() }, null, 2));

} catch (err) {
  console.error('❌ Failed to sync registry from Firestore:', err.message);
  // Don't fail the build — fall back to existing projects.json if it exists
  if (!fs.existsSync(OUTPUT_PATH)) {
    const dir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, '[]');
    console.warn('⚠️  Created empty projects.json as fallback');
  } else {
    console.warn('⚠️  Using existing projects.json as fallback');
  }
}
