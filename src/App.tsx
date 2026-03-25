import { useState, useEffect } from 'react';
import './App.css';
import StatusTab from './tabs/StatusTab';
import WorkflowTab from './tabs/WorkflowTab';
import OrganizerTab from './tabs/OrganizerTab';
import PairwiseTab from './tabs/PairwiseTab';
import ToDoTab from './tabs/ToDoTab';

type PrimaryTab = 'control' | 'thoughts';
type ControlSubTab = 'status' | 'workflow';
type ThoughtsSubTab = 'organizer' | 'pairwise' | 'todo';

export default function App() {
  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>('control');
  const [controlSub, setControlSub] = useState<ControlSubTab>('status');
  const [thoughtsSub, setThoughtsSub] = useState<ThoughtsSubTab>('organizer');
  const [isPrintable, setIsPrintable] = useState(false);

  useEffect(() => {
    if (isPrintable) document.documentElement.classList.add('theme-printable');
    else document.documentElement.classList.remove('theme-printable');
  }, [isPrintable]);

  return (
    <div className="app-container">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="logo-section">
          <img src="/3PMO_Logo.png" alt="3PMO Logo" className="logo-img"
            onError={e => { e.currentTarget.style.display = 'none'; }} />
          <h1 className="wordmark">
            <span className="wordmark-3">3</span>
            <span className="wordmark-pmo">PMO</span>
            <span className="wordmark-divider">-</span>
            <span className="wordmark-app">Hub</span>
          </h1>
        </div>

        {/* Primary navigation */}
        <nav className="primary-nav">
          <button
            className={`primary-tab-btn ${primaryTab === 'control' ? 'active' : ''}`}
            onClick={() => setPrimaryTab('control')}
          >
            ⚙ Control
          </button>
          <button
            className={`primary-tab-btn ${primaryTab === 'thoughts' ? 'active' : ''}`}
            onClick={() => setPrimaryTab('thoughts')}
          >
            💡 Thoughts
          </button>
        </nav>

        <div className="header-actions">
          <button className="theme-toggle-btn" onClick={() => setIsPrintable(!isPrintable)}>
            {isPrintable ? '🌙 Dark' : '🖨 Print'}
          </button>
        </div>
      </header>

      {/* ── Sub-nav ── */}
      <div className="sub-nav">
        {primaryTab === 'control' && (
          <>
            {(['status', 'workflow'] as ControlSubTab[]).map(t => (
              <button key={t}
                className={`sub-tab-btn ${controlSub === t ? 'active' : ''}`}
                onClick={() => setControlSub(t)}>
                {t === 'status' ? '📊 Status' : '🗺 Workflow'}
              </button>
            ))}
          </>
        )}
        {primaryTab === 'thoughts' && (
          <>
            {(['organizer', 'pairwise', 'todo'] as ThoughtsSubTab[]).map(t => (
              <button key={t}
                className={`sub-tab-btn ${thoughtsSub === t ? 'active' : ''}`}
                onClick={() => setThoughtsSub(t)}>
                {t === 'organizer' ? '🧠 Organizer' : t === 'pairwise' ? '⚖ Pairwise' : '✅ To-Do'}
              </button>
            ))}
          </>
        )}
      </div>

      {/* ── Content ── */}
      <main className="app-content">
        {primaryTab === 'control' && (
          <div className="tab-panel" key={controlSub}>
            {controlSub === 'status' && <StatusTab />}
            {controlSub === 'workflow' && <WorkflowTab />}
          </div>
        )}
        {primaryTab === 'thoughts' && (
          <div className="tab-panel" key={thoughtsSub}>
            {thoughtsSub === 'organizer' && <OrganizerTab />}
            {thoughtsSub === 'pairwise' && <PairwiseTab />}
            {thoughtsSub === 'todo' && <ToDoTab />}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <span className="wordmark-3">3</span><span className="wordmark-pmo">PMO</span>-Hub · Personal Productivity Hub
      </footer>
    </div>
  );
}
