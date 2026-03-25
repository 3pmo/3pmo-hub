# Quality Assurance & Testing Log

**Application:** Hub-WebApp (with To-Do tab)
**Goal:** Track all formal requirements, log identified bugs, and record the results of manual/automated testing against each release.

## 1. Requirements Log
All features must be signed off in this section before a release is considered verified.

| Req ID | Requirement Description | Verification Method | Status |
|---|---|---|---|
| REQ-001 | App must compile flawlessly via `npm run build` | Automated (Local script check) | ⚪ Untested |
| REQ-002 | `sync-registry.js` must process `project-registry.md` into `projects.json` | Automated (Local script check) | ⚪ Untested |
| REQ-003 | Default theme must be `3PMO Ultra-Dark` with `#050606` background | Manual UI check | ⚪ Untested |
| REQ-004 | Official `3PMO_Logo.png` must be presented in the top-left navigation | Manual UI check | ⚪ Untested |
| REQ-005 | Official `favicon.ico` must be used as the document icon | Manual UI check | ⚪ Untested |
| REQ-006 | "Printable" theme toggle must switch the UI to a high-contrast, light layout | Manual UI check | ⚪ Untested |
| REQ-007 | Google OAuth Login must successfully authenticate the user | Manual Web Auth | ⚪ Untested |
| REQ-008 | Google Tasks must populate the UI post-authentication | Manual Web Auth | ⚪ Untested |
| REQ-009 | CI/CD Action must successfully deploy the `master` branch to Firebase | Automated GitHub Action | ⚪ Untested |

---

## 2. Bug Log
Record any issues found during development or testing here.

| Bug ID | Description | Status | Resolution |
|---|---|---|---|
| BUG-001 | [Example] Sidebar overlaps on mobile | 🔴 Open | - |

---

## 3. Test Execution Records
For each release or major change, add a new test execution section below.

### Release V1.0.0 Prep
**Date:** TBD
**Tested By:** Agent / User
**Environment:** Local Dev (`npm run dev`) / Production (Firebase)

| Req ID | Pass/Fail | Notes |
|---|---|---|
| REQ-001 | ✅ Pass | `npm run build` completed successfully in 10.57s |
| REQ-002 | ✅ Pass | `node scripts/sync-registry.js` successfully output JSON |
| REQ-003 | ✅ Pass | Browser Agent verified `body` computed background is `rgb(5, 6, 6)`. |
| REQ-004 | ✅ Pass | Browser Agent verified `img.logo-img` points to `3PMO_Logo.png`. |
| REQ-005 | ✅ Pass | Browser Agent verified `link rel="icon"` points to `favicon.ico`. |
| REQ-006 | ✅ Pass | Browser Agent verified `theme-printable` class injection and `#ffffff` background after toggle click. [Recording](file:///C:/Users/willl/.gemini/antigravity/brain/0cb132fe-d319-4ab9-8a0a-e2e339b7b795/automated_ui_verification_1774171161957.webp) |
| REQ-007 | | |
| REQ-008 | | |
| REQ-009 | | |
