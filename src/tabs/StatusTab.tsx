import { useState, useEffect } from 'react';
import projectsData from '../assets/projects.json';

interface Project {
  name: string;
  status?: string;
  description?: string;
  current_ai?: string;
  last_active?: string;
  github?: string;
  backlog?: string;
  deploy?: string;
  local?: string;
}

const STATUS_COLOR: Record<string, string> = {
  'Active': '#7CC170',
  'Standing': '#FF9E1B',
  'Deployed': '#c4ff61',
  'Active Tab': '#6bcfff',
  'Initiating': '#aaaaaa',
};

export default function StatusTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    try {
      setProjects(projectsData as Project[]);
    } catch {
      setProjects([]);
    }
  }, []);

  const statuses = ['All', ...Array.from(new Set(projects.map(p => p.status || 'Unknown')))];

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="status-tab">
      <div className="tab-section-header">
        <h3>Project Status</h3>
        <p className="tab-section-desc">
          All active and standing projects — synced from <code>project-registry.md</code>.
          {' '}{projects.length} projects loaded.
        </p>
      </div>

      {/* Stats strip */}
      <div className="status-stats-row">
        {[
          { label: 'Total', value: projects.length },
          { label: 'Active', value: projects.filter(p => (p.status || '').includes('Active')).length },
          { label: 'Standing', value: projects.filter(p => p.status === 'Standing').length },
          { label: 'Tabs', value: projects.filter(p => p.status === 'Active Tab').length },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-num">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="status-filters">
        <input className="field-input search-input" placeholder="Search projects..." value={search}
          onChange={e => setSearch(e.target.value)} />
        <div className="filter-group">
          {statuses.map(s => (
            <button key={s} className={`filter-btn ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">No projects found. Run <code>npm run dev</code> to sync from registry.</div>
      ) : (
        <div className="projects-grid">
          {filtered.map(p => (
            <div key={p.name} className="card project-card">
              <div className="project-card-header">
                <span className="project-name">{p.name}</span>
                {p.status && (
                  <span className="status-badge"
                    style={{ background: (STATUS_COLOR[p.status] || '#7F8589') + '22', color: STATUS_COLOR[p.status] || '#7F8589' }}>
                    {p.status}
                  </span>
                )}
              </div>
              {p.description && <p className="project-desc">{p.description}</p>}
              <div className="project-meta">
                {p.last_active && <span>🕐 {p.last_active}</span>}
                {p.current_ai && <span>🤖 {p.current_ai}</span>}
                {p.github && (
                  <a href={`https://github.com/3pmo/${p.github}`} target="_blank" rel="noreferrer"
                    className="meta-link">⎇ GitHub</a>
                )}
              </div>
              {p.backlog && <div className="project-backlog">{p.backlog}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
