export default function BrandTab() {
  return (
    <div className="brand-tab">
      <div className="tab-section-header">
        <p className="tab-section-desc">
          The 3PMO Brand Authority guide for web applications, templates, and operational tools.
        </p>
      </div>

      <div className="brand-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
        {/* Theme 1: 3PMO Theme */}
        <div className="card theme-card pmo-theme">
          <div className="theme-badge" style={{ background: 'var(--pmo-green)', color: 'var(--ultra-dark-bg)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', width: 'fit-content', marginBottom: '1rem' }}>
            CANONICAL
          </div>
          <h3>3PMO Theme</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>
            Client-facing web applications and premium brand assets.
          </p>
          <ul className="brand-specs" style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
            <li><strong>Background:</strong> #050606 (Dark)</li>
            <li><strong>Primary:</strong> PMO Green (#7CC170)</li>
            <li><strong>Secondary:</strong> PMO Gold (#FF9E1B)</li>
            <li><strong>Font:</strong> Verdana</li>
          </ul>
          <div className="swatch-row" style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#050606', border: '1px solid #333' }} title="#050606" />
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#7CC170' }} title="#7CC170" />
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FF9E1B' }} title="#FF9E1B" />
          </div>
        </div>

        {/* Theme 2: Work Theme */}
        <div className="card theme-card work-theme" style={{ background: '#fff', color: '#333', border: '1px solid #ddd' }}>
          <div className="theme-badge" style={{ background: '#DB0011', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', width: 'fit-content', marginBottom: '1rem' }}>
            OPERATIONAL
          </div>
          <h3 style={{ color: '#000' }}>Work Theme</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1.5rem' }}>
            Pragmatic tools, status reports, and internal Excel exports.
          </p>
          <ul className="brand-specs" style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
            <li><strong>Background:</strong> #FFFFFF (Light)</li>
            <li><strong>Primary:</strong> Work Red (#DB0011)</li>
            <li><strong>Secondary:</strong> Neutral Greys</li>
            <li><strong>Font:</strong> Helvetica / Arial</li>
          </ul>
          <div className="swatch-row" style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #ddd' }} title="#FFFFFF" />
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#DB0011' }} title="#DB0011" />
          </div>
        </div>
      </div>

      <div className="card mt-4" style={{ marginTop: '2rem' }}>
        <h3>Decision Tree</h3>
        <p style={{ fontSize: '0.9rem' }}>
          <strong>Internal Ops/Analysis?</strong> → Work Theme (Red/White)<br/>
          <strong>Client-Facing/App?</strong> → 3PMO Theme (Dark/Green)
        </p>
      </div>
    </div>
  );
}
