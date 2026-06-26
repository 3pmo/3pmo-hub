/**
 * ArchitectureTab.tsx — 3PMO-Hub System Architecture
 *
 * DEPLOY TO: src/tabs/ArchitectureTab.tsx
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MAINTENANCE INSTRUCTIONS (for humans and AI agents):
 *   1. Update LAST_UPDATED whenever the architecture changes.
 *   2. Update the tab inventory below if tabs are added/removed.
 *   3. Update the data sources section if Firebase paths or external APIs change.
 *   4. The yellow warning banner fires automatically after 60 days — no manual action needed.
 *   5. Keep architecture.json (src/assets/architecture.json) in sync with this file.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * AI AGENT QUICK-REFERENCE (read this before making changes to any tab):
 *
 *   Firebase project : hub-3pmo (Blaze plan)
 *   Hosting          : hub-3pmo.web.app  (Firebase Hosting CDN)
 *   Auth             : Google OAuth 2.0 (signInWithPopup) — Google accounts only
 *   RTDB             : https://hub-3pmo-default-rtdb.firebaseio.com
 *   Firestore        : hub-3pmo (collections: projects, issues)
 *   Cloud Functions  : fetchClaudeUsage (HTTP callable), onIssueWrite (Firestore trigger)
 *   CI/CD            : push to master → GitHub Actions → firebase deploy (hosting + functions + rules)
 *   Framework        : React 19 + TypeScript + Vite 8
 *   Charting         : Recharts 3
 *   Brand            : 3PMO theme = Green (#2d6a4f) / Gold (#d4a017) / Verdana
 *
 *   TAB INVENTORY (9 tabs as of LAST_UPDATED):
 *   Control group  → WorkflowTab, BrandTab, ArchitectureTab, CostTrackerTab, IssueTrackerTab
 *   Thoughts group → OrganizerTab, PairwiseTab, ToDoTab
 *
 *   DATA SOURCES:
 *   IssueTrackerTab  → Firestore (issues, projects), src/assets/projects.json
 *   StatusTab        → Firestore (projects, issues) via onSnapshot
 *   CostTrackerTab   → RTDB hub_cost_tracker/daily/{provider}, RTDB hub_status/token_usage, Cloud Function fetchClaudeUsage
 *   OrganizerTab     → RTDB /thoughts (per-user, auth-gated)
 *   PairwiseTab      → RTDB /pairwise_analyses/{uid} (per-user, auth-gated)
 *   ToDoTab          → Google Tasks API (OAuth, tasks.readonly scope)
 *   WorkflowTab      → Static iframe → /workflow-diagram.html
 *   BrandTab         → Static (no external data)
 *   ArchitectureTab  → Static (this file)
 */

import React from 'react';

// ─── UPDATE THIS DATE WHENEVER THE ARCHITECTURE CHANGES ───────────────────────
const LAST_UPDATED = '2026-04-07';
const FRESHNESS_DAYS = 60; // Show warning banner after this many days
// ──────────────────────────────────────────────────────────────────────────────

const daysSince = (dateStr: string): number => {
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const tabs = [
  {
    group: 'CONTROL',
    items: [
      {
        name: 'Workflow',
        icon: '⚙️',
        plain: 'Shows the overall project workflow as an interactive diagram. A visual map of how work moves through the system.',
        data: 'Static HTML file (public/workflow-diagram.html) rendered in an iframe. No live data.',
      },
      {
        name: 'Brand',
        icon: '🎨',
        plain: 'Reference guide for the two visual themes used across 3PMO — the dark green/gold 3PMO style and the clean red/white Work style.',
        data: 'Static component. No external data.',
      },
      {
        name: 'Architecture',
        icon: '🏗️',
        plain: 'This page — a map of how the whole application is built and connected.',
        data: 'Static component. No external data.',
      },
      {
        name: 'Cost Tracker',
        icon: '💰',
        plain: 'Tracks AI tool spending across Claude, Gemini, and Antigravity. Shows token usage, daily trends, and a 7-day chart so you can see if costs are creeping up.',
        data: 'Firebase RTDB: hub_cost_tracker/daily/{provider} and hub_status/token_usage. Claude data fetched via Cloud Function (Anthropic Admin API). Gemini and Antigravity entered manually.',
      },
      {
        name: 'Issue Tracker',
        icon: '🐛',
        plain: 'The main project management board. Log bugs and improvements, track them through a 4-stage testing process (Compile → DoD → SIT → UAT), and close them off when done. Supports voice input.',
        data: 'Firestore: issues collection (real-time). Firestore: projects collection. src/assets/projects.json for project list dropdown.',
      },
    ],
  },
  {
    group: 'THOUGHTS',
    items: [
      {
        name: 'Organiser',
        icon: '🧠',
        plain: 'A personal capture tool for ideas, tasks, and observations. Rate each thought by impact, effort, and urgency — the app scores and surfaces the most valuable ones automatically. Supports voice input.',
        data: 'Firebase RTDB: /thoughts (per user, Google auth required). Real-time sync.',
      },
      {
        name: 'Pairwise',
        icon: '⚖️',
        plain: 'A decision-making tool. Give it a list of options and it walks you through comparing them two at a time, then produces a ranked result. Useful when you have too many things to prioritise intuitively.',
        data: 'Firebase RTDB: /pairwise_analyses/{uid} (per user, Google auth required).',
      },
      {
        name: 'To-Do',
        icon: '✅',
        plain: 'Your Google Tasks list, surfaced directly in the hub. Read-only view of your existing Google Tasks — no separate system to maintain.',
        data: 'Google Tasks API (OAuth 2.0, read-only). Requires Google sign-in.',
      },
    ],
  },
];

const layers = [
  {
    label: 'You',
    color: '#2d6a4f',
    textColor: '#fff',
    nodes: ['Browser (mobile or desktop) — https://hub-3pmo.web.app'],
  },
  {
    label: 'Delivery',
    color: '#40916c',
    textColor: '#fff',
    nodes: ['Firebase Hosting CDN', 'GitHub Actions (auto-deploy on push to master)'],
  },
  {
    label: 'App (React SPA)',
    color: '#52b788',
    textColor: '#fff',
    nodes: ['9 Tabs', 'Google OAuth 2.0 sign-in', 'Recharts visualisations'],
  },
  {
    label: 'Data & Logic',
    color: '#74c69d',
    textColor: '#1b4332',
    nodes: [
      'Firestore — projects & issues (real-time)',
      'RTDB — thoughts, pairwise, cost data (real-time)',
      'Cloud Functions — Claude usage fetch, issue count trigger',
    ],
  },
  {
    label: 'External APIs',
    color: '#d4a017',
    textColor: '#1b4332',
    nodes: [
      'Google Tasks API (read-only)',
      'Anthropic Admin API (Claude token usage)',
    ],
  },
];

export const ArchitectureTab: React.FC = () => {
  const staleDays = daysSince(LAST_UPDATED);
  const isStale = staleDays > FRESHNESS_DAYS;

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Verdana, sans-serif', maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '0.25rem' }}>
        <h1 style={{ color: '#2d6a4f', fontSize: '1.5rem', margin: 0 }}>System Architecture</h1>
        <p style={{ color: '#555', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
          Technical blueprint of the 3PMO-Hub React ecosystem and its integration with Firebase and Google APIs.
        </p>
      </div>

      {/* Freshness badge / warning */}
      <div style={{
        display: 'inline-block',
        marginTop: '0.75rem',
        marginBottom: '1.25rem',
        padding: '0.35rem 0.75rem',
        borderRadius: 4,
        fontSize: '0.78rem',
        backgroundColor: isStale ? '#fff3cd' : '#d1e7dd',
        color: isStale ? '#856404' : '#0f5132',
        border: `1px solid ${isStale ? '#ffc107' : '#a3cfbb'}`,
      }}>
        {isStale
          ? `⚠️  Last updated ${LAST_UPDATED} — ${staleDays} days ago. This diagram may be out of date. Update LAST_UPDATED in ArchitectureTab.tsx after any architectural change.`
          : `✅  Last updated ${LAST_UPDATED} — current`}
      </div>

      {/* Section 1: What Each Tab Does */}
      <h2 style={{ color: '#2d6a4f', fontSize: '1.1rem', borderBottom: '2px solid #d4a017', paddingBottom: '0.3rem' }}>
        The App at a Glance
      </h2>
      <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '1rem' }}>
        3PMO-Hub is a personal productivity dashboard with 9 tabs split into two groups.
      </p>

      {tabs.map(group => (
        <div key={group.group} style={{ marginBottom: '1.25rem' }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#2d6a4f',
            color: '#d4a017',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            letterSpacing: '0.08em',
            padding: '0.2rem 0.6rem',
            borderRadius: 3,
            marginBottom: '0.6rem',
          }}>
            {group.group}
          </div>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {group.items.map(tab => (
              <div key={tab.name} style={{
                display: 'grid',
                gridTemplateColumns: '130px 1fr',
                gap: '0.75rem',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderLeft: '4px solid #2d6a4f',
                borderRadius: 4,
                padding: '0.6rem 0.75rem',
              }}>
                <div>
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.1rem' }}>{tab.icon}</div>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#2d6a4f' }}>{tab.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#333', marginBottom: '0.3rem' }}>{tab.plain}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>
                    <span style={{ fontWeight: 'bold' }}>Data: </span>{tab.data}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Section 2: How It All Connects */}
      <h2 style={{ color: '#2d6a4f', fontSize: '1.1rem', borderBottom: '2px solid #d4a017', paddingBottom: '0.3rem', marginTop: '1.5rem' }}>
        How It All Connects
      </h2>
      <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
        The app is split into layers. Each row below depends on the one above it.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #dee2e6', borderRadius: 6, overflow: 'hidden', marginBottom: '1.5rem' }}>
        {layers.map((layer, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
            <div style={{
              backgroundColor: layer.color,
              color: layer.textColor,
              fontSize: '0.78rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.6rem',
              textAlign: 'center',
              borderBottom: i < layers.length - 1 ? '1px solid rgba(255,255,255,0.15)' : undefined,
            }}>
              {layer.label}
            </div>
            <div style={{
              backgroundColor: `${layer.color}18`,
              borderBottom: i < layers.length - 1 ? `1px solid ${layer.color}30` : undefined,
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.4rem',
            }}>
              {layer.nodes.map((node, j) => (
                <span key={j} style={{
                  backgroundColor: '#fff',
                  border: `1px solid ${layer.color}60`,
                  borderRadius: 3,
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.78rem',
                  color: '#333',
                }}>
                  {node}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Section 3: How Updates Are Released */}
      <h2 style={{ color: '#2d6a4f', fontSize: '1.1rem', borderBottom: '2px solid #d4a017', paddingBottom: '0.3rem', marginTop: '1.5rem' }}>
        How Updates Are Released
      </h2>
      <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
        No manual deployment steps are needed. The pipeline runs automatically.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {[
          'Code change on laptop',
          '→',
          'git push to master',
          '→',
          'GitHub Actions runs (npm build)',
          '→',
          'firebase deploy',
          '→',
          '✅ Live at hub-3pmo.web.app (~2 min)',
        ].map((step, i) => (
          step === '→'
            ? <span key={i} style={{ color: '#2d6a4f', fontWeight: 'bold', fontSize: '1rem' }}>→</span>
            : <span key={i} style={{
                backgroundColor: step.startsWith('✅') ? '#d1e7dd' : '#f8f9fa',
                border: `1px solid ${step.startsWith('✅') ? '#a3cfbb' : '#dee2e6'}`,
                borderRadius: 4,
                padding: '0.3rem 0.6rem',
                fontSize: '0.8rem',
                color: step.startsWith('✅') ? '#0f5132' : '#333',
              }}>
                {step}
              </span>
        ))}
      </div>

      {/* Footer note for AI agents */}
      <div style={{
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#f0f4f8',
        border: '1px solid #cdd8e3',
        borderRadius: 4,
        fontSize: '0.75rem',
        color: '#555',
      }}>
        <strong>For AI agents:</strong> The machine-readable version of this architecture is at{' '}
        <code>src/assets/architecture.json</code>. Read that file first before making structural changes.
        Full source-of-truth documentation is in{' '}
        <code>03-artifacts/system-architecture.md</code> (Drive) and{' '}
        <code>https://github.com/3pmo/3pmo-hub</code> (GitHub).
      </div>
    </div>
  );
};

export default ArchitectureTab;
