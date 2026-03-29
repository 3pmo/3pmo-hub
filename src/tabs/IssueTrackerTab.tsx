import { useState, useEffect } from 'react';
import { firestore } from '../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { formatDate } from '../utils/formatDate';

export interface Issue {
  id: string;
  project_slug: string;
  type: 'bug' | 'enhancement';
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
  title: string;
  description: string;
  status: 'New' | 'Open' | 'In Progress' | 'In Review' | 'Done' | 'Parked' | 'Closed';
  logged_date: string;
  test_unit: '⬜' | '✅' | 'N/A';
  test_sit: '⬜' | '✅' | 'N/A';
  test_uat: '⬜' | '✅' | 'N/A';
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

  // Filter Logic
  const filteredIssues = issues.filter(iss => {
    if (filterProject !== 'All' && iss.project_slug !== filterProject) return false;
    if (filterType !== 'All' && iss.type !== filterType) return false;
    
    if (filterStatus === 'Open') {
      if (['Done', 'Closed', 'Parked'].includes(iss.status)) return false;
    } else if (filterStatus !== 'All' && iss.status !== filterStatus) {
      return false;
    }
    return true;
  });

  // Sort Logic
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    let valA: any = a[sortField] || '';
    let valB: any = b[sortField] || '';

    // Handle Timestamps
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

  const handleRowClick = (issue: Issue) => {
    console.log("Edit issue clicked via row:", issue.id);
    // TODO: Stream C - open edit form
  };

  const getStatusClass = (status: string) => {
    if (['Closed', 'Done'].includes(status)) return 'success';
    if (['New', 'Parked'].includes(status)) return 'inactive'; // Grey
    if (['In Progress', 'In Review'].includes(status)) return 'warning'; // Gold
    return 'danger'; // Open / etc
  };

  if (loading) return <div className="loading">Loading Issues...</div>;

  return (
    <div className="issue-tracker-tab">
      <div className="tab-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <p className="tab-section-desc">
          Centralized tracking of all bugs and enhancements across projects.
        </p>
        <button className="btn-primary" onClick={() => console.log('Create new issue')} style={{ minWidth: '150px' }}>
          ＋ Log Issue
        </button>
      </div>

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

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th style={{ width: '120px' }}>Project</th>
              <th style={{ width: '80px' }}>Type</th>
              <th style={{ width: '80px' }}>Pri</th>
              <th>Title</th>
              <th style={{ width: '100px' }}>Status</th>
              <th style={{ width: '120px' }}>Tests (U/S/A)</th>
              <th style={{ width: '100px' }}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {sortedIssues.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--pmo-slate)' }}>
                  No issues match the current filters.
                </td>
              </tr>
            ) : sortedIssues.map(issue => (
              <tr key={issue.id} onClick={() => handleRowClick(issue)} style={{ cursor: 'pointer' }} className="clickable-row">
                <td style={{ fontFamily: 'monospace', color: 'var(--pmo-slate)' }}>{issue.id.substring(0,6)}</td>
                <td style={{ color: 'var(--pmo-gold)', fontWeight: 'bold' }}>{issue.project_slug}</td>
                <td>
                  <span className={`status-badge ${issue.type === 'bug' ? 'danger' : 'success'}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    {issue.type === 'bug' ? 'Bug' : 'Enh'}
                  </span>
                </td>
                <td style={{
                     color: issue.priority === 'P0' ? '#ff4757' : 
                            issue.priority === 'P1' ? 'var(--pmo-gold)' : 
                            'var(--text-primary)',
                     fontWeight: ['P0','P1'].includes(issue.priority) ? 'bold' : 'normal'
                }}>
                  {issue.priority}
                </td>
                <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {issue.title}
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(issue.status)}`} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                    {issue.status}
                  </span>
                </td>
                <td style={{ letterSpacing: '2px', fontSize: '1rem' }}>
                  {issue.test_unit}{issue.test_sit}{issue.test_uat}
                </td>
                <td style={{ color: 'var(--pmo-slate)', fontSize: '0.85rem' }}>
                  {issue.updated_at?.toMillis ? formatDate(new Date(issue.updated_at.toMillis()).toISOString()) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
