/**
 * migrate-backlogs.mjs
 * Migrates all existing BACKLOG.md files into the /issues Firestore collection.
 *
 * Usage:
 *   node scripts/migrate-backlogs.mjs
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
const REGISTRY_PATH = path.join(__dirname, '../src/assets/projects.json');

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

// ── Helpers ─────────────────────────────────────────────────────────────────
function parseMarkdownTable(markdown, sectionName, slug) {
  const issues = [];
  const lines = markdown.split('\n');
  let inSection = false;
  let headers = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('## ')) {
      inSection = line.includes(sectionName);
      continue;
    }

    if (inSection && line.startsWith('|')) {
      const cols = line.split('|').map(c => c.trim()).filter(c => c !== '');
      if (cols[0] === '#' || cols[0].includes('---')) {
        if (cols[0] === '#') headers = cols;
        continue; // skip header or separator
      }
      
      if (cols.length >= 3) { // usually #, Priority, Description...
         // Priority depends on the column index. Usually 1.
         let desc = cols[2] || '';
         let priority = cols[1] || 'P2';
         let logged = cols[3] || new Date().toISOString().slice(0, 10);
         let aiTest = cols[4] || '⬜';
         let uat = cols[5] || '⬜';

         const titleMatch = desc.match(/^([^.!?]+)/);
         const title = titleMatch ? titleMatch[1] : desc;

         let status = 'New';
         if (sectionName === 'Resolved Enhancements') {
           status = 'Closed';
         } else if (uat === '✅' || aiTest === '✅') {
           status = uat === '✅' ? 'Done' : 'In Progress';
         }

         issues.push({
           project_slug: slug,
           type: sectionName === 'Bugs' ? 'bug' : 'enhancement',
           priority: priority,
           title: title,
           description: desc,
           status,
           logged_date: logged,
           test_unit: aiTest,
           test_sit: aiTest, // mapping AI Test to both unit and sit
           test_uat: uat,
           created_at: admin.firestore.Timestamp.fromDate(new Date("2026-03-29T12:00:00Z")), // default historical
           created_by: "migration",
           updated_at: admin.firestore.FieldValue.serverTimestamp(),
           updated_by: "migration"
         });
      }
    }
  }
  return issues;
}

async function migrate() {
  const fileContent = fs.readFileSync(REGISTRY_PATH, 'utf-8');
  const projects = JSON.parse(fileContent);
  let totalMigrated = 0;

  console.log(`Starting migration for ${projects.length} projects...`);
  
  for (const proj of projects) {
    if (!proj.drive) continue;

    const backlogPath = path.join(proj.drive, '03-artifacts', 'BACKLOG.md');
    if (fs.existsSync(backlogPath)) {
      console.log(`Processing ${proj.name}...`);
      const md = fs.readFileSync(backlogPath, 'utf8');
      
      const bugs = parseMarkdownTable(md, 'Bugs', proj.name);
      const tier1 = parseMarkdownTable(md, 'Enhancements — Tier 1', proj.name);
      const tier2 = parseMarkdownTable(md, 'Enhancements — Tier 2', proj.name);
      const tier3 = parseMarkdownTable(md, 'Enhancements — Tier 3', proj.name);
      const resolved = parseMarkdownTable(md, 'Resolved Enhancements', proj.name);

      const allIssues = [...bugs, ...tier1, ...tier2, ...tier3, ...resolved];

      if (allIssues.length > 0) {
        const batch = firestore.batch();
        let openBugs = 0;
        let openEnhancements = 0;

        allIssues.forEach(issue => {
          const docRef = firestore.collection('issues').doc();
          batch.set(docRef, issue);
          
          if (!['Done', 'Closed', 'Parked'].includes(issue.status)) {
             if (issue.type === 'bug') openBugs++;
             if (issue.type === 'enhancement') openEnhancements++;
          }
        });

        // Patch the parent project document explicitly during migration
        const projRef = firestore.collection('projects').doc(proj.slug || proj.name);
        batch.update(projRef, {
            backlog_bugs: openBugs,
            backlog_enhancements: openEnhancements
        });

        await batch.commit();
        console.log(`  → Migrated ${allIssues.length} issues for ${proj.name} [Counts updated: ${openBugs} Bugs, ${openEnhancements} Enh]`);
        totalMigrated += allIssues.length;
      } else {
        console.log(`  → No issues found in table format for ${proj.name}`);
      }
    }
  }
  
  console.log(`\n✅ Migration complete! Total issues migrated: ${totalMigrated}`);
  process.exit(0);
}

migrate().catch(console.error);
