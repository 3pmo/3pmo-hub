import { useState, useEffect } from 'react';
import projectsData from '../assets/projects.json';
import { initGoogleAPI, handleAuthClick, fetchTasks } from '../services/googleTasks';

export default function ToDoTab() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isApiReady, setIsApiReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setProjects(projectsData);
    
    // Initialize Google API and pass callbacks
    initGoogleAPI(
      () => setIsApiReady(true),
      async () => {
        setIsAuthenticated(true);
        const fetchedTasks = await fetchTasks();
        setTasks(fetchedTasks);
      }
    );
  }, []);

  return (
    <div className="todo-tab">
      <h2>Google Tasks & Local Projects</h2>
      <p>This tab integrates your Google Tasks with your `project-registry.md` projects.</p>
      
      <div className="dashboard" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="card">
          <h3>Local Projects</h3>
          {projects.length === 0 ? (
            <p>No projects loaded. Run `npm run dev` to automatically sync.</p>
          ) : (
            <ul style={{ paddingLeft: '20px' }}>
              {projects.map(p => (
                <li key={p.name} style={{ marginBottom: '0.5rem' }}>
                  <strong>{p.name}</strong> - <span style={{ color: 'var(--pmo-gold)' }}>{p.status}</span>
                  <div style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>
                    {p.description}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="card">
          <h3>Google Tasks</h3>
          {!isAuthenticated ? (
            <button 
              onClick={handleAuthClick} 
              disabled={!isApiReady}
              style={{ marginBottom: '1rem', opacity: isApiReady ? 1 : 0.5 }}
            >
              {isApiReady ? 'Sign In with Google' : 'Loading API...'}
            </button>
          ) : (
            <div style={{ color: 'var(--agy-lime)', marginBottom: '1rem' }}>✓ Authenticated</div>
          )}
          
          {tasks.length === 0 ? (
            <p>{isAuthenticated ? "No active tasks found." : "Please authenticate to view tasks."}</p>
          ) : (
            <ul style={{ paddingLeft: '20px' }}>
              {tasks.map(t => (
                <li key={t.id} style={{ marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--pmo-green)', fontWeight: 'bold', marginRight: '8px' }}>[{t.listName}]</span>
                  {t.title}
                  {t.due && <div style={{ fontSize: '0.8em', color: 'var(--pmo-gold)' }}>Due: {new Date(t.due).toLocaleDateString()}</div>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
