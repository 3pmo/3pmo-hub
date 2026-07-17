import { useState, useEffect, useRef } from 'react';
import { db, auth, firestore } from '../services/firebase';
import { ref, push, set, onValue, off, remove } from 'firebase/database';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { createGoogleTask } from '../services/googleTasks';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import type { DataSnapshot } from 'firebase/database';

type ThoughtStatus = 'Idea' | 'Started' | 'Published' | 'Finished';
type ThoughtType = 'Task' | 'Project' | 'Learning' | 'Decision';
type ThoughtCategory = 'Personal' | 'Work' | 'Opportunities' | 'Family';

interface Thought {
  id: string;
  title: string;
  description: string;
  category: ThoughtCategory;
  type: ThoughtType;
  status: ThoughtStatus;
  impact: number;
  effort: number;
  urgency: number;
  weight: number;
  priorityScore: number;
  createdAt: number;
  tags: string;
}

function calcPriority(impact: number, effort: number, urgency: number) {
  const weight = Math.round((impact + (11 - effort) + urgency) / 3);
  const score = parseFloat(((impact + urgency + (11 - effort) + weight) / 4).toFixed(1));
  return { weight, score };
}

const CATEGORY_COLORS: Record<ThoughtCategory, string> = {
  Personal: '#7CC170', Work: '#FF9E1B', Opportunities: '#c4ff61', Family: '#469CBE',
};

export default function UnifiedOrganizerTab({ user }: { user: User | null }) {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [filterCat, setFilterCat] = useState<string>('All');
  const [isListening, setIsListening] = useState(false);
  const recogRef = useRef<any>(null);
  const [message, setMessage] = useState('');

  // Main Form State
  const [form, setForm] = useState({
    title: '', description: '', category: 'Work' as ThoughtCategory,
    type: 'Task' as ThoughtType, impact: 5, effort: 5, urgency: 5, tags: '',
  });

  useEffect(() => {
    if (!user) { setThoughts([]); return; }
    const thoughtsRef = ref(db, `thoughts/${user.uid}`);
    onValue(thoughtsRef, (snap: DataSnapshot) => {
      const data = snap.val();
      if (!data) { setThoughts([]); return; }
      const list = Object.entries(data).map(([id, v]: [string, any]) => ({ id, ...v })) as Thought[];
      list.sort((a, b) => b.priorityScore - a.priorityScore);
      setThoughts(list);
    });
    return () => off(ref(db, `thoughts/${user.uid}`));
  }, [user]);

  const handleLogin = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (err) { console.error(err); }
  };

  const startVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice capture not supported.'); return; }
    const rec = new SR();
    rec.lang = 'en-GB';
    rec.onresult = (e: any) => setForm(f => ({ ...f, title: e.results[0][0].transcript }));
    rec.onend = () => setIsListening(false);
    rec.start();
    setIsListening(true);
    recogRef.current = rec;
  };

  const showMsg = (txt: string) => {
    setMessage(txt);
    setTimeout(() => setMessage(''), 3000);
  };

  const saveAsThought = async () => {
    if (!form.title.trim() || !user) return;
    const { weight, score } = calcPriority(form.impact, form.effort, form.urgency);
    const thought: Omit<Thought, 'id'> = {
      ...form, weight, priorityScore: score, status: 'Idea', createdAt: Date.now(),
    };
    await push(ref(db, `thoughts/${user.uid}`), thought);
    showMsg('✓ Saved to Brainstorming');
    setForm(f => ({ ...f, title: '', description: '', tags: '' }));
  };

  const saveAsGoogleTask = async () => {
    if (!form.title.trim()) return;
    try {
      await createGoogleTask(form.title, form.description);
      showMsg('✓ Sent to Google Tasks');
      setForm(f => ({ ...f, title: '', description: '', tags: '' }));
    } catch (err) {
      alert('Failed to send to Google Tasks. Ensure you are signed in to Google Services in the To-Do tab.');
    }
  };

  const saveAsIssue = async () => {
    if (!form.title.trim()) return;
    try {
      await addDoc(collection(firestore, 'issues'), {
        title: form.title,
        description: form.description,
        project_slug: 'openclaw', // Defaulting to openclaw for now
        type: form.type === 'Task' ? 'bug' : 'enhancement',
        priority: 'P4',
        status: 'Open',
        logged_date: new Date().toISOString().split('T')[0],
        created_at: serverTimestamp(),
        test_compile: '⬜', test_dod: '⬜', test_sit: '⬜', test_uat: '⬜'
      });
      showMsg('✓ Logged as Firestore Issue');
      setForm(f => ({ ...f, title: '', description: '', tags: '' }));
    } catch (err) {
      console.error(err);
      alert('Failed to log issue. Check console.');
    }
  };

  const saveAsProject = async () => {
    if (!form.title.trim()) return;
    try {
      await addDoc(collection(firestore, 'projects'), {
        name: form.title,
        description: form.description,
        status: 'Active (Initiating)',
        category: 'active',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        current_ai: 'AntiGravity'
      });
      showMsg('✓ Created Firestore Project');
      setForm(f => ({ ...f, title: '', description: '', tags: '' }));
    } catch (err) {
      console.error(err);
      alert('Failed to create project.');
    }
  };

  const [isPairwiseMode, setIsPairwiseMode] = useState(false);
  const [pwPairIdx, setPwPairIdx] = useState(0);

  const startPairwise = () => {
    if (filtered.length < 2) {
      alert('Need at least 2 thoughts in this category to prioritize.');
      return;
    }
    setPwPairIdx(0);
    setIsPairwiseMode(true);
  };

  const getPairs = (items: Thought[]) => {
    const pairs: [Thought, Thought][] = [];
    for (let i = 0; i < items.length - 1; i++)
      for (let j = i + 1; j < items.length; j++)
        pairs.push([items[i], items[j]]);
    return pairs;
  };

  const handlePwChoose = async (winner: Thought, _loser: Thought) => {
    // We increment the score of the winner locally and push it to RTDB
    const newScore = (winner.priorityScore || 0) + 0.1;
    await set(ref(db, `thoughts/${user?.uid}/${winner.id}/priorityScore`), parseFloat(newScore.toFixed(1)));
    
    const pairs = getPairs(filtered);
    if (pwPairIdx < pairs.length - 1) {
      setPwPairIdx(p => p + 1);
    } else {
      setIsPairwiseMode(false);
      showMsg('Priority scores updated!');
    }
  };

  if (!user) {

    return (
      <div className="org-auth-screen">
        <div className="glass-card auth-content">
          <h1>Welcome to 3PMO Organizer</h1>
          <p>Sign in to consolidate your thoughts, tasks, and project issues.</p>
          <button onClick={handleLogin} className="btn-glow">Sign In with Google</button>
        </div>
      </div>
    );
  }

  const filtered = thoughts.filter(t => filterCat === 'All' || t.category === filterCat);
  const { score: previewScore } = calcPriority(form.impact, form.effort, form.urgency);

  return (
    <div className="unified-organizer">
      {message && <div className="toast-msg">{message}</div>}

      <div className="org-top-bar">
        <div className="user-info">
          <span className="dot active" /> {user.email}
        </div>
        <button className="btn-text" onClick={() => signOut(auth)}>Sign Out</button>
      </div>

      <div className="org-grid">
        {/* ── Left: capture ── */}
        <div className="capture-zone">
          <div className="glass-card capture-card">
            <h3 className="section-title">Quick Capture</h3>
            <div className="capture-input-area">
              <input 
                className="main-input" 
                placeholder="What's on your mind?" 
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
              <button className={`mic-btn ${isListening ? 'active' : ''}`} onClick={startVoice}>
                {isListening ? '⏺' : '🎤'}
              </button>
            </div>
            <textarea 
              className="sub-input" 
              placeholder="Add details, links, or context..."
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />

            <div className="property-grid">
              <div className="prop-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}>
                  {['Personal','Work','Opportunities','Family'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="prop-group">
                <label>Impact: {form.impact}</label>
                <input type="range" min="1" max="10" value={form.impact} onChange={e => setForm(f => ({ ...f, impact: +e.target.value }))} />
              </div>
              <div className="prop-group">
                <label>Urgency: {form.urgency}</label>
                <input type="range" min="1" max="10" value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: +e.target.value }))} />
              </div>
              <div className="prop-group">
                <label>Effort: {form.effort}</label>
                <input type="range" min="1" max="10" value={form.effort} onChange={e => setForm(f => ({ ...f, effort: +e.target.value }))} />
              </div>
            </div>

            <div className="priority-preview">
              <div className="score-ring">
                <span className="score-val">{previewScore}</span>
                <span className="score-lbl">Priority</span>
              </div>
            </div>

            <div className="action-row">
              <div className="action-group">
                <span className="action-label">Save to Brain</span>
                <button className="btn-action primary" onClick={saveAsThought}>🧠 Thought</button>
              </div>
              <div className="action-group">
                <span className="action-label">Distribute to Ecosystem</span>
                <div className="btn-cluster">
                  <button className="btn-action" onClick={saveAsGoogleTask}>✅ Task</button>
                  <button className="btn-action" onClick={saveAsIssue}>🎯 Issue</button>
                  <button className="btn-action" onClick={saveAsProject}>🏗 Project</button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card info-card">
            <h4>How it works</h4>
            <p><strong>Thoughts</strong> go to your personal backlog for further refinement and pairwise analysis.</p>
            <p><strong>Tasks</strong> are pushed to Google Tasks for mobile/daily execution.</p>
            <p><strong>Issues</strong> are logged to Firestore to track development work across your AI projects.</p>
          </div>
        </div>

        {/* ── Right: list ── */}
        <div className="backlog-zone">
          <div className="glass-card list-card">
            <div className="list-header">
              <h3>Brainstorming Backlog</h3>
              <div className="list-actions">
                <button className="btn-secondary btn-sm" onClick={startPairwise}>⚖ Prioritize</button>
                <div className="cat-filters">
                  {['All','Work','Personal','Opportunities'].map(c => (
                    <button key={c} className={`cat-btn ${filterCat === c ? 'active' : ''}`} onClick={() => setFilterCat(c)}>{c}</button>
                  ))}
                </div>
              </div>
            </div>

            {isPairwiseMode ? (
              <div className="pairwise-overlay">
                <div className="pw-header">
                  <h4>Prioritizing {filterCat}</h4>
                  <button className="btn-text" onClick={() => setIsPairwiseMode(false)}>Cancel</button>
                </div>
                {(() => {
                  const pairs = getPairs(filtered);
                  const pair = pairs[pwPairIdx];
                  if (!pair) return null;
                  return (
                    <div className="pw-arena">
                      <div className="pw-progress">Compare {pwPairIdx + 1} / {pairs.length}</div>
                      <div className="pw-choice-row">
                        <button className="pw-box" onClick={() => handlePwChoose(pair[0], pair[1])}>{pair[0].title}</button>
                        <span className="vs">VS</span>
                        <button className="pw-box" onClick={() => handlePwChoose(pair[1], pair[0])}>{pair[1].title}</button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="thought-scroll">

              {filtered.length === 0 ? (
                <div className="empty-state">No thoughts captured yet.</div>
              ) : filtered.map(t => (
                <div key={t.id} className="thought-item">
                  <div className="t-priority">{t.priorityScore}</div>
                  <div className="t-main">
                    <div className="t-title">{t.title}</div>
                    <div className="t-meta">
                      <span className="t-cat" style={{ color: CATEGORY_COLORS[t.category] }}>{t.category}</span>
                      {t.description && <span className="t-desc-preview"> — {t.description.substring(0, 40)}...</span>}
                    </div>
                  </div>
                  <div className="t-actions">
                    <button className="icon-btn" onClick={() => remove(ref(db, `thoughts/${user.uid}/${t.id}`))}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
