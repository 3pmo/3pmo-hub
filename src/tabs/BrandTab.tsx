import { useState } from 'react';

type SubTab = '3pmo' | 'work' | 'wizard';

export default function BrandTab() {
  const [subTab, setSubTab] = useState<SubTab>('3pmo');

  // Decision Tree Wizard State
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [purpose, setPurpose] = useState<'client' | 'internal' | null>(null);
  const [isWebapp, setIsWebapp] = useState<boolean | null>(null);
  const [isSpreadsheet, setIsSpreadsheet] = useState<boolean | null>(null);

  const resetWizard = () => {
    setWizardStep(1);
    setPurpose(null);
    setIsWebapp(null);
    setIsSpreadsheet(null);
  };

  return (
    <div className="brand-tab animate-in">
      <div className="tab-section-header" style={{ marginBottom: '1.5rem' }}>
        <p className="tab-section-desc">
          The 3PMO Brand Authority interactive guide for web applications, templates, operational tools, and documents.
        </p>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="org-filters" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
        <button
          className={`filter-btn glass-panel ${subTab === '3pmo' ? 'active' : ''}`}
          onClick={() => setSubTab('3pmo')}
        >
          🎨 3PMO Theme (Canonical)
        </button>
        <button
          className={`filter-btn glass-panel ${subTab === 'work' ? 'active' : ''}`}
          onClick={() => setSubTab('work')}
        >
          🔧 Work Theme (Operational)
        </button>
        <button
          className={`filter-btn glass-panel ${subTab === 'wizard' ? 'active' : ''}`}
          onClick={() => setSubTab('wizard')}
        >
          🌳 Decision Tree Wizard
        </button>
      </div>

      {/* ── Sub-Tab 1: 3PMO Theme ── */}
      {subTab === '3pmo' && (
        <div className="theme-content animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            
            {/* Specs Card */}
            <div className="card glass-panel" style={{ borderLeft: '4px solid var(--pmo-green)' }}>
              <div className="theme-badge" style={{ background: 'var(--pmo-green)', color: 'var(--ultra-dark-bg)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', width: 'fit-content', marginBottom: '1rem' }}>
                CLIENT-FACING & PREMIUM
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>3PMO Theme Specs</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Sleek, tech-focused dark mode design for web applications and public-facing assets.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#050606', border: '1px solid var(--border-subtle)' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Background</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--pmo-grey)', fontFamily: 'monospace' }}>#050606 (Dark Mode)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#7CC170' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Primary Accent</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--pmo-grey)', fontFamily: 'monospace' }}>#7CC170 (PMO Green)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#FF9E1B' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Secondary Accent</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--pmo-grey)', fontFamily: 'monospace' }}>#FF9E1B (PMO Gold)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)', fontFamily: 'Verdana' }}>V</div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Typography</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--pmo-grey)' }}>Verdana (Clean geometric sans-serif)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Visual Spec Frame */}
            <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Interactive UI Specimen</h3>
                
                {/* Mini App Preview Frame */}
                <div style={{ background: '#050606', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1.25rem', fontFamily: 'Verdana, sans-serif' }}>
                  
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--pmo-grey)', fontWeight: 'bold', fontSize: '0.9rem' }}>3</span>
                      <span style={{ color: 'var(--pmo-green)', fontWeight: 'bold', fontSize: '0.9rem' }}>PMO</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--pmo-gold)', fontWeight: 'bold' }}>SPEC PREVIEW</span>
                  </div>

                  {/* Component Previews */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--pmo-grey)', marginBottom: '4px' }}>Primary Button (Solid Pill, Gold Accent, Glow Hover)</span>
                      <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Primary Button</button>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--pmo-grey)', marginBottom: '4px' }}>Secondary Button (Outline Pill, Green Hover Accent)</span>
                      <button className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>Secondary Button</button>
                    </div>

                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--pmo-grey)', marginBottom: '4px' }}>Tab Selection Indicator</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="filter-btn active" style={{ padding: '3px 10px', fontSize: '0.75rem' }}>Active Tab</button>
                        <button className="filter-btn" style={{ padding: '3px 10px', fontSize: '0.75rem' }}>Inactive Tab</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--pmo-grey)' }}>
                ℹ️ Hover over the buttons above to test live micro-animations (lift & glow).
              </div>
            </div>

          </div>

          {/* Use Cases & Media Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div className="card glass-panel">
              <h4 style={{ color: 'var(--pmo-gold)', marginBottom: '0.75rem' }}>📋 Recommended Use Cases</h4>
              <ul className="brand-specs" style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Client-facing web applications & platforms</li>
                <li>Public marketing sites and materials</li>
                <li>Strategic slides and pitch decks</li>
                <li>Official high-visibility digital publications</li>
              </ul>
            </div>

            <div className="card glass-panel">
              <h4 style={{ color: 'var(--pmo-green)', marginBottom: '0.75rem' }}>📁 Deliverables & Media Specs</h4>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <strong>Webpages:</strong> Use the standard template boilerplates. Make sure to copy the official logo from Drive to <code style={{ color: 'var(--pmo-green)' }}>/public/3PMO_Logo.png</code>.
                </div>
                <div>
                  <strong>Word Documents / PDFs:</strong> If printing, use the <strong>Printable Theme Wrapper</strong> (white background, slate headings `#4A4A4A`, gold horizontal separators, and zero box shadows).
                </div>
              </div>
            </div>

          </div>

          {/* Code Snippet block */}
          <div className="card glass-panel">
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>⚙️ Design System Tokens (CSS Variables)</h4>
            <pre style={{ margin: 0, background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', overflowX: 'auto', fontSize: '0.8rem', color: '#a5d6a7', border: '1px solid var(--border-subtle)' }}>
{`:root {
  --bg-primary: #050606;
  --text-primary: #FFFFFF;
  --pmo-green: #7CC170;
  --pmo-gold: #FF9E1B;
  --btn-radius-pmo: 999px; /* Pill capsule shape */
  --shadow-glow: 0 0 12px rgba(124, 193, 112, 0.4);
  --shadow-gold-glow: 0 0 12px rgba(255, 158, 27, 0.4);
}`}
            </pre>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--pmo-grey)' }}>
            ⚠️ All changes must be conformed against the canonical <a style={{ color: 'var(--pmo-gold)' }} href="file:///c:/Users/willl/My%20Drive/AI/_System/Brand/Design/BRAND.md">BRAND.md</a> guidelines.
          </div>

        </div>
      )}

      {/* ── Sub-Tab 2: Work Theme ── */}
      {subTab === 'work' && (
        <div className="theme-content animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            
            {/* Specs Card */}
            <div className="card glass-panel" style={{ borderLeft: '4px solid #001EFF' }}>
              <div className="theme-badge" style={{ background: '#001EFF', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', width: 'fit-content', marginBottom: '1rem' }}>
                INTERNAL & PRAGMATIC
              </div>
              <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Work Theme Specs</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Highly readable, structured light mode layout designed for operational reports, data tables, and internal tooling.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid #CCC' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Background</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--pmo-grey)', fontFamily: 'monospace' }}>#FFFFFF (Pure White)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#001EFF' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Primary Accent</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--pmo-grey)', fontFamily: 'monospace' }}>#001EFF (LSEG Blue)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#F4F4F4', border: '1px solid #DDD' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Secondary elements</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--pmo-grey)', fontFamily: 'monospace' }}>#F4F4F4 (Neutral Greys)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)', fontFamily: 'Calibri, Arial' }}>C</div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Typography</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--pmo-grey)' }}>Calibri / Arial (Highly legible body text)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Visual Spec Frame */}
            <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Interactive UI Specimen</h3>
                
                {/* Mini App Preview Frame */}
                <div style={{ background: '#FFFFFF', border: '1px solid #CCC', borderRadius: '8px', padding: '1.25rem', fontFamily: 'Calibri, Arial, sans-serif', color: '#333' }}>
                  
                  {/* Header Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #EEE', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ color: '#001EFF', fontWeight: 'bold', fontSize: '1rem' }}>Ops Dashboard</span>
                    <span style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', border: '1px solid #DDD', padding: '2px 6px', borderRadius: '4px' }}>INTERNAL ONLY</span>
                  </div>

                  {/* Component Previews */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: '#666', marginBottom: '4px' }}>Primary Button (4px Radius)</span>
                        <button style={{ background: '#001EFF', color: '#FFFFFF', border: 'none', borderRadius: '4px', padding: '6px 16px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>Save Data</button>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.65rem', color: '#666', marginBottom: '4px' }}>Secondary (Flat Grey)</span>
                        <button style={{ background: '#F4F4F4', color: '#333', border: '1px solid #CCC', borderRadius: '4px', padding: '6px 16px', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>

                    {/* Table Preview */}
                    <div>
                      <span style={{ display: 'block', fontSize: '0.65rem', color: '#666', marginBottom: '4px' }}>Spreadsheet Layout (Calibri / Alternate Row Bgs)</span>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: '1px solid #DDD' }}>
                        <thead>
                          <tr style={{ background: '#001EFF', color: '#FFFFFF', fontWeight: 'bold' }}>
                            <th style={{ padding: '4px 8px', textAlign: 'left', border: '1px solid #DDD' }}>Project</th>
                            <th style={{ padding: '4px 8px', textAlign: 'left', border: '1px solid #DDD' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ background: '#FFF' }}>
                            <td style={{ padding: '4px 8px', border: '1px solid #DDD' }}>3pmo-hub</td>
                            <td style={{ padding: '4px 8px', border: '1px solid #DDD', color: '#2e7d32', fontWeight: 'bold' }}>Active</td>
                          </tr>
                          <tr style={{ background: '#F9F9F9' }}>
                            <td style={{ padding: '4px 8px', border: '1px solid #DDD' }}>brand</td>
                            <td style={{ padding: '4px 8px', border: '1px solid #DDD', color: '#2e7d32', fontWeight: 'bold' }}>Active</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', fontSize: '0.8rem', color: 'var(--pmo-grey)' }}>
                ℹ️ The Work theme prioritises square structures and standard light mode printing.
              </div>
            </div>

          </div>

          {/* Use Cases & Media Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div className="card glass-panel">
              <h4 style={{ color: '#001EFF', marginBottom: '0.75rem' }}>📋 Recommended Use Cases</h4>
              <ul className="brand-specs" style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Internal management tools & admin screens</li>
                <li>Weekly operational spreadsheets (`.xlsx`)</li>
                <li>Technical design proposals & logs</li>
                <li>System auditing reports and analytics</li>
              </ul>
            </div>

            <div className="card glass-panel">
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>📁 Deliverables & Media Specs</h4>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <strong>Excel (.xlsx) Files:</strong> Must follow the Calibri formatting guidelines. Use the <code style={{ color: 'var(--pmo-gold)' }}>xlsx-template</code> python openpyxl setup to compile headers in LSEG Blue (`#001EFF`).
                </div>
                <div>
                  <strong>Word Documents:</strong> White background, sans-serif headings, page borders in light neutral grey, primary title text in Work Red or LSEG Blue.
                </div>
              </div>
            </div>

          </div>

          {/* Code Snippet block */}
          <div className="card glass-panel">
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>⚙️ Design System Tokens (CSS Variables)</h4>
            <pre style={{ margin: 0, background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', overflowX: 'auto', fontSize: '0.8rem', color: '#90caf9', border: '1px solid var(--border-subtle)' }}>
{`[data-theme="work"] {
  --bg-primary: #FFFFFF;
  --text-primary: #333333;
  --btn-radius-work: 4px; /* Square-ish shape */
  --btn-primary-bg: #001EFF; /* LSEG Blue */
  --btn-primary-fg: #FFFFFF;
  --border-subtle: #D7D8D6;
}`}
            </pre>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--pmo-grey)' }}>
            ⚠️ All changes must be conformed against the canonical <a style={{ color: 'var(--pmo-gold)' }} href="file:///c:/Users/willl/My%20Drive/AI/_System/Brand/Design/BRAND.md">BRAND.md</a> guidelines.
          </div>

        </div>
      )}

      {/* ── Sub-Tab 3: Decision Tree Wizard ── */}
      {subTab === 'wizard' && (
        <div className="theme-content animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card glass-panel" style={{ padding: '2rem', textAlign: 'center', maxWidth: '650px', margin: '0 auto', width: '100%' }}>
            
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              🌴 Brand Theme Decision Wizard
            </h3>

            {/* Step 1: Purpose */}
            {wizardStep === 1 && (
              <div className="animate-in">
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                  What is the primary purpose and audience of the output?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                  <button
                    className="btn-primary"
                    style={{ width: '100%', maxWidth: '320px', padding: '12px' }}
                    onClick={() => {
                      setPurpose('client');
                      setWizardStep(2);
                    }}
                  >
                    🚀 Client-Facing / Marketing
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ width: '100%', maxWidth: '320px', padding: '12px' }}
                    onClick={() => {
                      setPurpose('internal');
                      setWizardStep(2);
                    }}
                  >
                    🔧 Internal Ops / Analysis
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Client Path */}
            {wizardStep === 2 && purpose === 'client' && (
              <div className="animate-in">
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                  Are you building a Web Application?
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    className="btn-primary"
                    style={{ padding: '10px 24px' }}
                    onClick={() => {
                      setIsWebapp(true);
                      setWizardStep(3);
                    }}
                  >
                    Yes, a Web App
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '10px 24px' }}
                    onClick={() => {
                      setIsWebapp(false);
                      setWizardStep(3);
                    }}
                  >
                    No (Presentation / PDF / Doc)
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Internal Path */}
            {wizardStep === 2 && purpose === 'internal' && (
              <div className="animate-in">
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                  Is it a spreadsheet, status report, or data dump?
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    className="btn-primary"
                    style={{ padding: '10px 24px' }}
                    onClick={() => {
                      setIsSpreadsheet(true);
                      setWizardStep(3);
                    }}
                  >
                    Yes, a Spreadsheet/Report
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '10px 24px' }}
                    onClick={() => {
                      setIsSpreadsheet(false);
                      setWizardStep(3);
                    }}
                  >
                    No (Internal tool or text doc)
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Result Rendering */}
            {wizardStep === 3 && (
              <div className="animate-in" style={{ padding: '1rem' }}>
                
                {purpose === 'client' && (
                  <div style={{ border: '1px solid var(--pmo-green)', background: 'rgba(124, 193, 112, 0.05)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--pmo-green)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Recommendation</span>
                    <h4 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>✨ Use 3PMO Theme (Dark Mode)</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                      {isWebapp 
                        ? 'Deploy using the "react-webapp-template" (for React SPAs) or "webapp-template" (for static HTML pages) in 04-templates/.' 
                        : 'Deploy using Verdana fonts with PMO Gold (#FF9E1B) primary buttons and PMO Green (#7CC170) highlights.'}
                    </p>
                  </div>
                )}

                {purpose === 'internal' && (
                  <div style={{ border: '1px solid #001EFF', background: 'rgba(0, 30, 255, 0.05)', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#90caf9', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Recommendation</span>
                    <h4 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>🔧 Use Work Theme (Light Mode)</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                      {isSpreadsheet 
                        ? 'Deploy using the "xlsx-template" (openpyxl configuration) with LSEG Blue (#001EFF) headers, alternate grey row fills, and Calibri font.'
                        : 'Deploy using clean white backgrounds, Calibri/Arial typography, and square-ish buttons (4px border-radius, LSEG Blue background).'}
                    </p>
                  </div>
                )}

                <button
                  className="filter-btn active"
                  style={{ marginTop: '1rem', padding: '8px 20px', cursor: 'pointer' }}
                  onClick={resetWizard}
                >
                  🔄 Reset Wizard
                </button>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
