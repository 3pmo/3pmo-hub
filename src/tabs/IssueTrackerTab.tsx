import { useState, useEffect } from 'react';
import { firestore } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { formatDate } from '../utils/formatDate';
import projects from '../assets/projects.json';

export interface Issue {
  id: string;
  project_slug: string;
  type: 'bug' | 'enhancement';
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'UAT' | 'Done' | 'Parked';
  logged_date: string;
  test_compile: '⬜' | '✅' | 'N/A';
  test_dod: '⬜' | '✅' | 'N/A';
  test_sit: '⬜' | '✅' | 'N/A';
  test_uat: '⬜' | '✅' | 'N/A';
  dod_items?: { task: string; completed: boolean }[];
  created_at?: any;
  created_by?: string;
  updated_at?: any;
  updated_by?: string;
}

export default function IssueTrackerTab() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterProject, setFilterProject] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('Open'); // Open = Not Done/Closed/Parked

  // Sort
  const [sortField, setSortField] = useState<'priority' | 'project_slug' | 'updated_at'>('priority');
  const [sortAsc, setSortAsc] = useState(true);

  // Form / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [formData, setFormData] = useState<Partial<Issue>>({
    title: '',
    description: '',
    project_slug: '',
    type: 'enhancement',
    priority: 'P4',
    status: 'Open',
    test_compile: '⬜',
    test_dod: '⬜',
    test_sit: '⬜',
    test_uat: '⬜',
    dod_items: []
  });

  useEffect(() => {
    const q = query(collection(firestore, 'issues'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsed: Issue[] = [];
      snapshot.forEach(doc => {
        parsed.push({ id: doc.id, ...doc.data() } as Issue);
      });
      setIssues(parsed);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Pre-type-filter: used for stat tile counts (project + status only)
  const preTypeFiltered = issues.filter(iss => {
    if (filterProject !== 'All' && iss.project_slug !== filterProject) return false;
    if (filterStatus === 'Open') {
      if (['Done', 'Closed', 'Parked'].includes(iss.status)) return false;
    } else if (filterStatus !== 'All' && iss.status !== filterStatus) {
      return false;
    }
    return true;
  });

  // Full filter (including type)
  const filteredIssues = preTypeFiltered.filter(iss => {
    if (filterType !== 'All' && iss.type !== filterType) return false;
    return true;
  });

  // Stat tile counts (from pre-type-filter so counts are always visible)
  const bugCount = preTypeFiltered.filter(i => i.type === 'bug').length;
  const enhCount = preTypeFiltered.filter(i => i.type === 'enhancement').length;

  // Sort Logic
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    let valA: any = a[sortField] || '';
    let valB: any = b[sortField] || '';

    if (sortField === 'updated_at') {
      valA = a.updated_at?.toMillis ? a.updated_at.toMillis() : Date.now();
      valB = b.updated_at?.toMillis ? b.updated_at.toMillis() : Date.now();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Unique projects for dropdown
  const uniqueProjects = Array.from(new Set(issues.map(i => i.project_slug))).sort();

  const handleLogIssue = () => {
    setEditingIssue(null);
    setFormData({
      title: '',
      description: '',
      project_slug: '',
      type: 'enhancement',
      priority: 'P4',
      status: 'Open',
      test_compile: '⬜',
      test_dod: '⬜',
      test_sit: '⬜',
      test_uat: '⬜',
      dod_items: []
    });
    setIsModalOpen(true);
  };

  const handleRowClick = (issue: Issue) => {
    setEditingIssue(issue);
    setFormData({ ...issue });
    setIsModalOpen(true);
  };

  const handleTestCycle = (field: 'test_compile' | 'test_dod' | 'test_sit' | 'test_uat') => {
    const cycle: Record<string, '⬜' | '✅' | 'N/A'> = { '⬜': '✅', '✅': 'N/A', 'N/A': '⬜' };
    const newValue = cycle[formData[field] || '⬜'];
    
    setFormData(prev => {
      const updated = { ...prev, [field]: newValue };
      
      // Auto-transition logic
      if (field === 'test_compile' && newValue === '✅' && prev.status === 'Open') {
        updated.status = 'In Progress';
      }
      if (field === 'test_sit' && newValue === '✅' && prev.status === 'In Progress') {
        updated.status = 'UAT';
      }
      
      return updated;
    });
  };

  const handleToggleDoD = (index: number) => {
    setFormData(prev => {
      const newItems = [...(prev.dod_items || [])];
      newItems[index] = { ...newItems[index], completed: !newItems[index].completed };
      return { ...prev, dod_items: newItems };
    });
  };

  const handleAddDoD = () => {
    const task = prompt("Enter DoD task:");
    if (task) {
      setFormData(prev => ({
        ...prev,
        dod_items: [...(prev.dod_items || []), { task, completed: false }]
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      updated_at: serverTimestamp(),
      updated_by: 'user'
    };

    try {
      if (editingIssue) {
        const docRef = doc(firestore, 'issues', editingIssue.id);
        await updateDoc(docRef, data as any);
      } else {
        await addDoc(collection(firestore, 'issues'), {
          ...data,
          created_at: serverTimestamp(),
          created_by: 'user',
          logged_date: new Date().toISOString().split('T')[0]
        });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving issue:", err);
      alert("Failed to save issue.");
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'Done') return 'success';
    if (status === 'Parked') return 'inactive';
    if (status === 'In Progress') return 'warning';
    if (status === 'UAT') return 'warning';
    return 'danger';
  };

  if (loading) return <div className="loading">Loading Issues...</div>;

  return (
    <div className="issue-tracker-tab">
      <div className="tab-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <p className="tab-section-desc">
          Centralized tracking of all bugs and enhancements across projects.
        </p>
        <button className="btn-primary" onClick={handleLogIssue} style={{ minWidth: '150px' }}>
          ＋ Log Issue
        </button>
      </div>

      {/* ── E1: Stat Tiles ── */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterType('All')}
          style={{
            flex: '1 1 120px',
            padding: '0.75rem 1rem',
            background: filterType === 'All' ? 'var(--pmo-gold)' : 'var(--bg-card)',
            color: filterType === 'All' ? '#000' : 'var(--text-primary)',
            border: `1px solid ${filterType === 'All' ? 'var(--pmo-gold)' : 'var(--border-subtle)'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left' as const,
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', lineHeight: 1 }}>{preTypeFiltered.length}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '2px' }}>Total</div>
        </button>
        <button
          onClick={() => setFilterType(filterType === 'bug' ? 'All' : 'bug')}
          style={{
            flex: '1 1 120px',
            padding: '0.75rem 1rem',
            background: filterType === 'bug' ? '#ff475720' : 'var(--bg-card)',
            color: filterType === 'bug' ? '#ff4757' : 'var(--text-primary)',
            border: `1px solid ${filterType === 'bug' ? '#ff4757' : 'var(--border-subtle)'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left' as const,
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', lineHeight: 1 }}>{bugCount}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '2px' }}>🐛 Bugs</div>
        </button>
        <button
          onClick={() => setFilterType(filterType === 'enhancement' ? 'All' : 'enhancement')}
          style={{
            flex: '1 1 120px',
            padding: '0.75rem 1rem',
            background: filterType === 'enhancement' ? 'var(--pmo-green, #7CC17020)' : 'var(--bg-card)',
            color: filterType === 'enhancement' ? 'var(--pmo-green, #7CC170)' : 'var(--text-primary)',
            border: `1px solid ${filterType === 'enhancement' ? 'var(--pmo-green, #7CC170)' : 'var(--border-subtle)'}`,
            borderRadius: '6px',
            cursor: 'pointer',
            textAlign: 'left' as const,
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ fontSize: '1.6rem', fontWeight: 'bold', lineHeight: 1 }}>{enhCount}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '2px' }}>🚀 Enhancements</div>
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--pmo-slate)', fontWeight: 'bold' }}>Project</label>
          <select className="filter-select" value={filterProject} onChange={e => setFilterProject(e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            <option value="All">All Projects</option>
            {uniqueProjects.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--pmo-slate)', fontWeight: 'bold' }}>Type</label>
          <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            <option value="All">All Types</option>
            <option value="bug">Bug</option>
            <option value="enhancement">Enhancement</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--pmo-slate)', fontWeight: 'bold' }}>Status</label>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            <option value="All">All Statuses</option>
            <option value="Open">Active (Open+In Prog)</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done/Closed</option>
            <option value="Parked">Parked</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--pmo-slate)', fontWeight: 'bold' }}>Sort By</label>
          <select className="filter-select" value={`${sortField}-${sortAsc}`} onChange={e => {
            const [f, a] = e.target.value.split('-');
            setSortField(f as any);
            setSortAsc(a === 'true');
          }} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
            <option value="priority-true">Priority (P0 → P4)</option>
            <option value="priority-false">Priority (P4 → P0)</option>
            <option value="project_slug-true">Project (A → Z)</option>
            <option value="updated_at-false">Recently Updated</option>
          </select>
        </div>
      </div>

      <div className="issue-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sortedIssues.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--pmo-slate)' }}>
            No issues match the current filters.
          </div>
        ) : sortedIssues.map(issue => (
          <div 
            key={issue.id} 
            onClick={() => handleRowClick(issue)} 
            className="card clickable-row" 
            style={{ 
              padding: '1.25rem', 
              cursor: 'pointer',
              borderLeft: `4px solid ${
                issue.priority === 'P0' ? '#ff4757' : 
                issue.priority === 'P1' ? 'var(--pmo-gold)' : 
                'var(--border-subtle)'
              }`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--pmo-slate)' }}>#{issue.id.substring(0,6)}</span>
                  <span style={{ color: 'var(--pmo-gold)', fontWeight: 'bold' }}>{issue.project_slug}</span>
                  <span className={`status-badge ${issue.type === 'bug' ? 'danger' : 'success'}`} style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>
                    {issue.type === 'bug' ? 'Bug' : 'Enh'}
                  </span>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 'bold',
                    color: issue.priority === 'P0' ? '#ff4757' : issue.priority === 'P1' ? 'var(--pmo-gold)' : 'var(--text-primary)'
                  }}>
                    {issue.priority}
                  </span>
                </div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{issue.title}</h4>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span className={`status-badge ${getStatusClass(issue.status)}`} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                  {issue.status}
                </span>
                <div style={{ display: 'flex', gap: '4px', fontSize: '1.1rem' }}>
                  <span title="Compile">{issue.test_compile}</span>
                  <span title="DoD">{issue.test_dod}</span>
                  <span title="SIT">{issue.test_sit}</span>
                  <span title="UAT">{issue.test_uat}</span>
                </div>
              </div>
            </div>
            
            <p style={{ 
              margin: '0.5rem 0 0.75rem 0', 
              fontSize: '0.9rem', 
              color: 'var(--pmo-slate)',
              whiteSpace: 'pre-wrap',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {issue.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ color: 'var(--pmo-slate)' }}>
                {issue.dod_items && issue.dod_items.length > 0 && (
                  <span>DoD: {issue.dod_items.filter(i => i.completed).length}/{issue.dod_items.length} tasks</span>
                )}
              </div>
              <div style={{ color: 'var(--pmo-slate)' }}>
                Updated: {issue.updated_at?.toMillis ? formatDate(new Date(issue.updated_at.toMillis()).toISOString()) : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Issue Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingIssue ? 'Edit Issue' : 'Log New Issue'}</h3>
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)} style={{ fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleSave} className="capture-form">
              <div className="form-row">
                <div style={{ flex: 2 }}>
                  <label className="slider-label">Project</label>
                  <select
                    className="field-select"
                    value={formData.project_slug}
                    onChange={e => setFormData(f => ({ ...f, project_slug: e.target.value }))}
                    required
                  >
                    <option value="" disabled>Select project...</option>
                    {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="slider-label">Type</label>
                  <select
                    className="field-select"
                    value={formData.type}
                    onChange={e => setFormData(f => ({ ...f, type: e.target.value as any }))}
                  >
                    <option value="bug">Bug</option>
                    <option value="enhancement">Enhancement</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="slider-label">Priority</label>
                  <select
                    className="field-select"
                    value={formData.priority}
                    onChange={e => setFormData(f => ({ ...f, priority: e.target.value as any }))}
                  >
                    {['P0', 'P1', 'P2', 'P3', 'P4'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="slider-label">Title</label>
                <input
                  className="field-input"
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="Summarize the issue..."
                  required
                />
              </div>

              <div>
                <label className="slider-label">Description</label>
                <textarea
                  className="field-input"
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="More context, expected behavior, logs..."
                />
              </div>

              <div className="form-row" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <label className="slider-label">Status</label>
                  <select
                    className="field-select"
                    value={formData.status}
                    onChange={e => setFormData(f => ({ ...f, status: e.target.value as any }))}
                  >
                    {['Open', 'In Progress', 'UAT', 'Done', 'Parked'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 2, display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingBottom: '4px' }}>
                  {[
                    { key: 'test_compile', label: 'Comp', tip: 'Build successful, Zero lints' },
                    { key: 'test_dod', label: 'DoD', tip: 'Checklist 100% complete' },
                    { key: 'test_sit', label: 'SIT', tip: 'Integrated & Verified' },
                    { key: 'test_uat', label: 'UAT', tip: "Approved by user in chat" }
                  ].map(test => (
                    <div key={test.key} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--pmo-slate)', marginBottom: '4px' }}>
                        {test.label}
                      </div>
                      <button
                        type="button"
                        className="icon-btn"
                        title={test.tip}
                        onClick={() => handleTestCycle(test.key as any)}
                        style={{ fontSize: '1.2rem', padding: '0.4rem 0.8rem', width: '45px', opacity: (test.key === 'test_uat' && formData.test_sit !== '✅') ? 0.4 : 1 }}
                        disabled={test.key === 'test_uat' && formData.test_sit !== '✅'}
                      >
                        {formData[test.key as keyof Issue] as string}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {formData.test_sit === '✅' && formData.test_uat !== '✅' && (
                <div style={{ 
                  background: 'var(--pmo-gold-20)', 
                  padding: '0.75rem', 
                  borderRadius: '6px', 
                  fontSize: '0.85rem', 
                  border: '1px solid var(--pmo-gold)',
                  marginBottom: '1rem'
                }}>
                  ⚠️ <strong>Manual Gate:</strong> UAT requires explicit approval from Will in chat before marking as passed.
                </div>
              )}

              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="slider-label" style={{ margin: 0 }}>Definition of Done Checklist</label>
                  <button type="button" onClick={handleAddDoD} style={{ fontSize: '0.75rem', padding: '2px 8px' }} className="btn-secondary">＋ Task</button>
                </div>
                <div style={{ 
                  background: 'var(--bg-main)', 
                  padding: '1rem', 
                  borderRadius: '6px', 
                  border: '1px solid var(--border-subtle)',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  {(!formData.dod_items || formData.dod_items.length === 0) ? (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--pmo-slate)', fontStyle: 'italic' }}>No tasks added. Click "+ Task" to start.</p>
                  ) : (
                    formData.dod_items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <input 
                          type="checkbox" 
                          checked={item.completed} 
                          onChange={() => handleToggleDoD(idx)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span style={{ 
                          fontSize: '0.9rem', 
                          textDecoration: item.completed ? 'line-through' : 'none',
                          color: item.completed ? 'var(--pmo-slate)' : 'var(--text-primary)'
                        }}>
                          {item.task}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setFormData(f => ({ ...f, dod_items: f.dod_items?.filter((_, i) => i !== idx) }))}
                          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '0.8rem' }}
                        >✕</button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.6rem 2rem' }}>
                  {editingIssue ? 'Update Issue' : 'Log Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
