import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { ref, onValue, off } from 'firebase/database';

interface ModelUsage {
  input_tokens: number;
  output_tokens: number;
  estimated_cost_cents?: number;
  total_cost?: number; // legacy support
  last_updated: number;
  limits: {
    daily_input: number;
    daily_output: number;
  };
}

interface TokenUsage {
  claude: ModelUsage;
  gemini: ModelUsage;
}

export default function CostTrackerTab() {
  const [usage, setUsage] = useState<TokenUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenRef = ref(db, 'hub_status/token_usage');
    onValue(tokenRef, (snapshot) => {
      setUsage(snapshot.val());
      setLoading(false);
    });
    return () => off(tokenRef);
  }, []);

  const renderGauge = (name: string, data: ModelUsage | undefined) => {
    if (!data || !data.limits) return null;

    const used = (data.input_tokens || 0) + (data.output_tokens || 0);
    const limit = (data.limits.daily_input || 0) + (data.limits.daily_output || 0);
    const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
    const cost = data.estimated_cost_cents 
      ? (data.estimated_cost_cents / 100).toFixed(2)
      : (data.total_cost || 0).toFixed(2);

    return (
      <div className="card cost-card" key={name}>
        <div className="cost-card-header">
          <h3 className="cost-card-title">{name} Usage</h3>
          <span className={`status-badge ${pct > 80 ? 'blocked' : pct > 50 ? 'standing' : 'active'}`}>
            {pct > 80 ? 'Critical' : pct > 50 ? 'Warning' : 'Healthy'}
          </span>
        </div>

        <div className="gauge-container">
          <div className="gauge-track">
            <div 
              className={`gauge-fill ${pct > 80 ? 'danger' : pct > 50 ? 'warning' : 'success'}`} 
              style={{ width: `${pct}%` }} 
            />
          </div>
          <div className="gauge-stats">
            <span>{pct.toFixed(1)}% Capacity Used</span>
            <span>Est. Cost: ${cost}</span>
          </div>
        </div>

        <div className="cost-details">
          <div className="cost-detail-item">
            <label>Input Tokens</label>
            <span>{(data.input_tokens || 0).toLocaleString()} / {data.limits.daily_input?.toLocaleString()}</span>
          </div>
          <div className="cost-detail-item">
            <label>Output Tokens</label>
            <span>{(data.output_tokens || 0).toLocaleString()} / {data.limits.daily_output?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Initializing Spend Tracker...</div>;

  return (
    <div className="cost-tracker-tab">
      <div className="tab-section-header">
        <p className="tab-section-desc">
          Real-time tracking of AI API consumption and estimated spend across the 3PMO Hub ecosystem.
        </p>
      </div>

      <div className="cost-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        {renderGauge('Claude Code', usage?.claude)}
        {renderGauge('Gemini AI', usage?.gemini)}
      </div>

      <div className="card mt-4" style={{ marginTop: '2rem', borderLeft: '4px solid var(--pmo-gold)' }}>
        <h4 style={{ color: 'var(--pmo-gold)', marginBottom: '0.5rem' }}>💡 Spend Optimization</h4>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
          Daily resets occur at 00:00 UTC. Claude usage is pulled from the Anthropic Analytics API, while Gemini is manually tracked or estimated via usage caps. 
          To minimize costs, use <code>claude commit</code> sparingly for small changes.
        </p>
      </div>
    </div>
  );
}
