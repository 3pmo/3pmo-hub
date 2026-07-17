import { useState, useEffect } from 'react';
import { firestore } from '../services/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { formatDate } from '../utils/formatDate';

interface StatusTabProps {
  onUpdate?: (ts: string) => void;
}

interface Project {
  name: string;
  status?: string | null;
  description?: string | null;
  current_ai?: string | null;
  last_active?: any; // Firestore Timestamp
  github_repo?: string | null;
  drive_path?: string | null;
  local_path?: string | null;
  category?: string | null;
  created_at?: any; // Added for project growth trend (#a0oY7P)
}

interface Issue {
  id: string;
  project_slug: string;
  type: 'bug' | 'enhancement';
  status: string;
  logged_date?: any; // String or Timestamp
  created_at?: any;
  updated_at?: any;
}

const STATUS_COLOR: Record<string, string> = {
  'Active': '#7CC170',
  'Standing': '#FF9E1B',
  'Deployed': '#c4ff61',
  'Active Tab': '#469CBE',
  'Initiating': '#aaaaaa',
};

export default function StatusTab({ onUpdate }: StatusTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState<'all' | 'bug' | 'enhancement'>('all');

  // ── Live projects from Firestore (Sync with SSOT) ──
  useEffect(() => {
    const q = query(collection(firestore, 'projects'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsed: Project[] = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          name: d.name || doc.id,
          status: d.status || null,
          description: d.description || null,
          current_ai: d.current_ai || null,
          // Firestore Timestamp to ISO string
          last_active: d.last_active,
          github_repo: d.github_repo || null,
          drive_path: d.drive_path || null,
          local_path: d.local_path || null,
          category: d.category || 'active',
          created_at: d.created_at || null,
        } as Project;
      });

      const order: Record<string, number> = { standing: 0, active: 1, tab: 2 };
      const sorted = parsed.sort((a, b) => {
        const ao = order[a.category!] ?? 9;
        const bo = order[b.category!] ?? 9;
        if (ao !== bo) return ao - bo;
        return a.name.localeCompare(b.name);
      });

      setProjects(sorted);
      setProjectsLoading(false);
      const ts = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (onUpdate) onUpdate(`Live Sync: ${ts}`);
    });
    return () => unsubscribe();
  }, [onUpdate]);

  // ── Live issues from Firestore ──
  useEffect(() => {
    const q = query(collection(firestore, 'issues'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIssues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Issue));
      setIssuesLoading(false);
      const ts = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (onUpdate) onUpdate(`Live Sync: ${ts}`);
    });
    return () => unsubscribe();
  }, [onUpdate]);

  // ── 0. CALCULATE ALL PROJECT COUNTS (Pre-filter) ──
  const issuesByProject = issues.reduce((acc, iss) => {
    if (['Done', 'Closed', 'Parked'].includes(iss.status)) return acc;
    if (!acc[iss.project_slug]) acc[iss.project_slug] = { bugs: 0, enhancements: 0 };
    if (iss.type === 'bug') acc[iss.project_slug].bugs++;
    else acc[iss.project_slug].enhancements++;
    return acc;
  }, {} as Record<string, { bugs: number; enhancements: number }>);

  // ── 1. FILTER PROJECTS ──
  const filteredProjects = projects.filter(p => {
    const matchSearch = !search
      || p.name.toLowerCase().includes(search.toLowerCase())
      || (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    
    // KPI Filter logic (#kRWMiI: hide projects with 0 matching active issues)
    const liveCounts = issuesByProject[p.name];
    const matchType = filterType === 'all' || 
                    (filterType === 'bug' && (liveCounts?.bugs || 0) > 0) ||
                    (filterType === 'enhancement' && (liveCounts?.enhancements || 0) > 0);

    return matchSearch && matchStatus && matchType;
  });

  const filteredProjectSlugs = new Set(filteredProjects.map(p => p.name));

  // ── 2. FILTER ISSUES BY VIEW (For Metrics & Graph) ──
  const inViewIssues = issues.filter(i => {
    const matchProject = filteredProjectSlugs.has(i.project_slug);
    const matchTypeFilter = filterType === 'all' || i.type === filterType;
    return matchProject && matchTypeFilter;
  });

  // ── 3. KPI COUNTS (Filtered) ──
  const activeIssues = inViewIssues.filter(i => !['Done', 'Closed', 'Parked'].includes(i.status));
  const activeBugsCount = activeIssues.filter(i => i.type === 'bug').length;
  const activeEnhsCount = activeIssues.filter(i => i.type === 'enhancement').length;
  const totalBugsInView = inViewIssues.filter(i => i.type === 'bug').length;
  const totalEnhsInView = inViewIssues.filter(i => i.type === 'enhancement').length;

  // ── 4. GRAPH DATA (Total Work - #tiFQG9 & #a0oY7P) ──
  const graphData = (() => {
    const byDate: Record<string, { date: string; added: number; resolved: number; projects: number }> = {};
    
    // Track project creation
    projects.forEach(p => {
      const cd = p.created_at as any;
      const createdDate: string | null = (cd?.toDate ? cd.toDate().toISOString().slice(0, 10) : (typeof cd === 'string' ? cd.slice(0,10) : null));
      if (createdDate && !isNaN(new Date(createdDate).getTime())) {
        if (!byDate[createdDate]) byDate[createdDate] = { date: createdDate, added: 0, resolved: 0, projects: 0 };
        byDate[createdDate].projects++;
      }
    });

    inViewIssues.forEach(iss => {
      // Added
      const ld = iss.logged_date as any;
      const addDate: string | null = (typeof ld === 'string' && ld.length >= 10) ? ld.slice(0,10)
        : (ld?.toDate ? ld.toDate().toISOString().slice(0, 10) : null)
          ?? (iss.created_at?.toDate ? iss.created_at.toDate().toISOString().slice(0, 10) : null);
      
      if (addDate && !isNaN(new Date(addDate).getTime())) {
        if (!byDate[addDate]) byDate[addDate] = { date: addDate, added: 0, resolved: 0, projects: 0 };
        byDate[addDate].added++;
      }

      // Resolved
      if (['Done', 'Closed'].includes(iss.status)) {
        const ud = iss.updated_at as any;
        const resDate: string | null = (ud?.toDate ? ud.toDate().toISOString().slice(0, 10) : null);
        if (resDate && !isNaN(new Date(resDate).getTime())) {
          if (!byDate[resDate]) byDate[resDate] = { date: resDate, added: 0, resolved: 0, projects: 0 };
          byDate[resDate].resolved++;
        }
      }
    });

    const sorted = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    let cumulativeIssues = 0;
    let cumulativeProjects = 0;
    let cumulativeResolved = 0;

    return sorted.map(d => {
      cumulativeIssues = Math.max(0, cumulativeIssues + d.added - d.resolved);
      cumulativeProjects += d.projects;
      cumulativeResolved += d.resolved;
      
      // Robust date parsing (#a0oY7P fix for "Invalid Date" bug)
      let dateObj: Date;
      if (/^\d{4}-\d{2}-\d{2}$/.test(d.date)) {
        const [y, m, day] = d.date.split('-').map(Number);
        dateObj = new Date(y, m - 1, day);
      } else {
        dateObj = new Date(d.date); // Fallback for other valid date strings
      }

      const displayDate = isNaN(dateObj.getTime()) 
        ? 'Unknown' 
        : dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

      return {
        ...d,
        active: cumulativeIssues,
        totalProjects: cumulativeProjects,
        totalResolved: cumulativeResolved,
        displayDate,
      };
    }).filter(d => d.displayDate !== 'Unknown');
  })();

  const statuses = ['All', ...Array.from(new Set(projects.map(p => p.status || 'Unknown')))];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel" style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--pmo-gold)' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', fontSize: '0.75rem', marginBottom: '2px' }}>
              <span style={{ color: entry.color || entry.fill }}>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="status-tab">

      {/* ── KPI Stats Strip (#kRWMiI: adds live bug/enh counts) ── */}
      <div className="status-stats-row">
        {[
          { label: 'Total Projects', value: projects.length, onClick: () => { setFilterStatus('All'); setFilterType('all'); } },
          { label: 'Active Projects', value: projects.filter(p => (p.status || '').includes('Active')).length, onClick: () => { setFilterStatus('Active'); setFilterType('all'); } },
          { label: 'Standing', value: projects.filter(p => p.status === 'Standing').length, onClick: () => { setFilterStatus('Standing'); setFilterType('all'); } },
        ].map((s, idx) => (
          <button 
            key={s.label} 
            className={`stat-card stat-card--btn glass-panel animate-in`} 
            style={{ animationDelay: `${idx * 0.1}s` }}
            onClick={s.onClick}
          >
            <div className="stat-num">{projectsLoading ? '…' : s.value}</div>
            <div className="stat-label">{s.label}</div>
          </button>
        ))}
        <button 
          className={`stat-card stat-card--bug stat-card--btn glass-panel animate-in ${filterType === 'bug' ? 'glass-panel-gold' : ''}`}
          style={{ animationDelay: '0.3s' }}
          onClick={() => setFilterType(filterType === 'bug' ? 'all' : 'bug')}
        >
          <div className="stat-num">{issuesLoading ? '…' : activeBugsCount}</div>
          <div className="stat-label">🐛 Active Bugs</div>
          {!issuesLoading && <div className="stat-sub">of {totalBugsInView} in view</div>}
        </button>
        <button 
          className={`stat-card stat-card--enh stat-card--btn glass-panel animate-in ${filterType === 'enhancement' ? 'glass-panel-green' : ''}`}
          style={{ animationDelay: '0.4s' }}
          onClick={() => setFilterType(filterType === 'enhancement' ? 'all' : 'enhancement')}
        >
          <div className="stat-num">{issuesLoading ? '…' : activeEnhsCount}</div>
          <div className="stat-label">🚀 Active Enhancements</div>
          {!issuesLoading && <div className="stat-sub">of {totalEnhsInView} in view</div>}
        </button>
      </div>

      {/* ── Issue Graph (Composed Chart - Resolved + Added + Cumulative - #tiFQG9 & #a0oY7P) ── */}
      {!issuesLoading && graphData.length > 0 && (
        <div className="card status-graph-card glass-panel animate-in" style={{ animationDelay: '0.5s' }}>
          <div className="status-graph-header">
            <h3 className="status-graph-title">System Activity & Project Growth</h3>
            <div className="status-graph-meta">
              <span className="status-graph-sub">
                {filterType === 'all' ? 'All Issues' : filterType === 'bug' ? 'Bugs Only' : 'Enhancements Only'} · 
                {filteredProjects.length} Projects in view
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={graphData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#469CBE" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#469CBE" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 10, fill: 'var(--pmo-grey)' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--pmo-grey)' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--pmo-gold)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '20px' }} iconType="circle" />
              
              <Bar yAxisId="left" dataKey="added" name="New Work" fill="url(#colorAdded)" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar yAxisId="left" dataKey="resolved" name="Settled" fill="#66BB6A" radius={[4, 4, 0, 0]} barSize={12} opacity={0.6} />
              
              <Line yAxisId="left" type="monotone" dataKey="active" name="Active Backlog" stroke="#FFD700" strokeWidth={3} dot={false} strokeDasharray="5 5" />
              <Line yAxisId="left" type="monotone" dataKey="totalResolved" name="Total Resolved" stroke="#a5d6a7" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="totalProjects" name="Total Projects" stroke="#FF9E1B" strokeWidth={4} dot={{ r: 4, fill: '#FF9E1B', strokeWidth: 0 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="status-filters animate-in" style={{ animationDelay: '0.6s' }}>
        <input
          className="field-input search-input glass-panel"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="filter-group">
          {statuses.map(s => (
            <button
              key={s}
              className={`filter-btn glass-panel ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >{s}</button>
          ))}
        </div>
      </div>

       {/* ── Projects Grid ── */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state animate-in">No projects found.</div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((p, idx) => {
            const liveCounts = issuesByProject[p.name];
            return (
              <div 
                key={p.name} 
                className="card project-card glass-panel animate-in"
                style={{ animationDelay: `${0.7 + (idx * 0.05)}s` }}
              >
                <div className="project-card-header">
                  <span className="project-name">{p.name}</span>
                  {p.status && (
                    <span
                      className="status-badge"
                      style={{
                        background: (STATUS_COLOR[p.status] || '#7F8589') + '22',
                        color: STATUS_COLOR[p.status] || '#7F8589',
                        border: `1px solid ${(STATUS_COLOR[p.status] || '#7F8589')}44`
                      }}
                    >{p.status}</span>
                  )}
                </div>

                {p.description && <p className="project-desc">{p.description}</p>}

                <div className="project-meta">
                  {p.last_active && <span>🕐 {formatDate(p.last_active?.toDate ? p.last_active.toDate() : p.last_active)}</span>}
                  {p.current_ai && <span>🤖 {p.current_ai}</span>}
                  {/* Drive URL (#doCrHy fix: using drive_path) */}
                  {p.drive_path?.startsWith('http') && (
                    <a className="meta-link" href={p.drive_path} target="_blank" rel="noreferrer">☁ Drive</a>
                  )}
                  {p.github_repo && (
                    <a
                      href={`https://github.com/${p.github_repo.replace(/`/g, '')}`}
                      target="_blank" rel="noreferrer"
                      className="meta-link"
                    >⎇ GitHub</a>
                  )}
                </div>

                {/* Live issue counts from Firestore (#ZKsdzd) */}
                {!issuesLoading && (
                  <div className="project-issue-counts">
                    <span className={`issue-chip glass-panel ${(liveCounts?.bugs || 0) > 0 ? 'issue-chip--bug' : 'issue-chip--zero'}`}>
                      {`🐛 ${liveCounts?.bugs || 0} Active Bug${(liveCounts?.bugs || 0) !== 1 ? 's' : ''}`}
                    </span>
                    <span className="issue-chip-sep"> | </span>
                    <span className={`issue-chip glass-panel ${(liveCounts?.enhancements || 0) > 0 ? 'issue-chip--enh' : 'issue-chip--zero'}`}>
                      {`🚀 ${liveCounts?.enhancements || 0} Active Enhancement${(liveCounts?.enhancements || 0) !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
