import React, { useState, useMemo } from 'react';
import { Download, CheckSquare, X, Info, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

type Capability = {
  id: string;
  name: string;
  domain: string;
  zone: string;
  icon: string;
  description: string;
  isExecutionOnly?: boolean;
  isPerfIndicator?: boolean;
};

type AssessmentData = {
  q1: number; // Repeatability (0-10)
  q2: number; // Maturity (1-4)
  q3: number; // Understanding (0-7)
};

const CAPABILITIES: Capability[] = [
  // Strategy
  { id: 'c1', name: 'Vision & Objectives', domain: 'Strategy Alignment', zone: 'Strategy Execution', icon: '🔭', description: 'Articulate & communicate the multi-year vision, overarching objectives, and core strategic priorities to guide all downstream planning 1, 6.' },
  { id: 'c2', name: 'Target Setting', domain: 'Strategy Alignment', zone: 'Strategy Execution', icon: '🎯', description: 'Establishing quantifiable baseline constraints and target thresholds across cost, resource capacity, work volume, and value delivery 1, 6.' },
  { id: 'c3', name: 'Horizon Scanning', domain: 'Strategy Alignment', zone: 'Strategy Execution', icon: '📡', description: 'Systematically monitoring macroeconomic trends, market disruptions, and regulatory shifts to proactively inform strategic pivots 1, 6.' },
  { id: 'c4', name: 'Prioritisation Management', domain: 'Strategy Alignment', zone: 'Strategy Execution', icon: '⚖', description: 'Evaluating and ranking proposed investments against strategic drivers to ensure optimal allocation of enterprise funding 1, 6.' },
  
  // Risk & Plan
  { id: 'c5', name: 'Risk Management', domain: 'Risk & Plan Management', zone: 'Strategy Execution', icon: '⚠️', description: 'Systematically identifying, logging, and mitigating execution risks, issues, and cross-portfolio dependencies (RAID) to protect outcomes 3, 7.' },
  { id: 'c6', name: 'Work Breakdown Plan Management', domain: 'Risk & Plan Management', zone: 'Strategy Execution', icon: '🗂', description: 'Formulating executable roadmaps, scenario-based schedules, and granular work breakdown structures to sequence delivery 3, 7.' },
  { id: 'c7', name: 'Cost Plan Management', domain: 'Risk & Plan Management', zone: 'Strategy Execution', icon: '💰', description: 'Forecasting capital and operational expenditures (CapEx/OpEx) and actively managing budgets against actual spend 3, 7.' },
  { id: 'c8', name: 'Resource Plan Management', domain: 'Risk & Plan Management', zone: 'Strategy Execution', icon: '👥', description: 'Modeling workforce capacity and allocating personnel based on skill availability to prevent bottlenecks and execution delays 3, 7.' },
  { id: 'c9', name: 'Value Realisation Plan Management', domain: 'Risk & Plan Management', zone: 'Strategy Execution', icon: '💎', description: 'Defining anticipated business benefits and tracking Objectives and Key Results (OKRs) to measure the return on strategic investments 3, 7.' },
  
  // Design & Delivery
  { id: 'c10', name: 'Business Design', domain: 'Design & Delivery Management', zone: 'Strategy Execution', icon: '🏢', description: 'Architecting the target-state operating model, defining future business capabilities, and re-engineering organizational processes 3, 8.' },
  { id: 'c11', name: 'Technology Design', domain: 'Design & Delivery Management', zone: 'Strategy Execution', icon: '💻', description: 'Blueprinting the enterprise IT architecture, platform ecosystems, and software solutions required to enable business capabilities 4, 8.' },
  { id: 'c12', name: 'Data Design', domain: 'Design & Delivery Management', zone: 'Strategy Execution', icon: '🗄', description: 'Standardizing enterprise data models, integration flows, and quality governance to ensure integrity across digital assets 4, 8.' },
  { id: 'c13', name: 'Adoption & Change Management', domain: 'Design & Delivery Management', zone: 'Strategy Execution', icon: '🎓', description: 'Orchestrating stakeholder engagement, organizational readiness, and training programs to ensure a seamless transition to new operating models 4, 8.' },
  { id: 'c14', name: 'Delivery Management', domain: 'Design & Delivery Management', zone: 'Strategy Execution', icon: '🚀', description: 'Governing the end-to-end software and product development lifecycle, from build and test through to production release 4, 8.' },
  
  // Performance Management
  { id: 'c15', name: 'Performance Indicator Management', domain: 'Performance', zone: 'Performance', icon: '📊', isPerfIndicator: true, description: 'Monitoring real-time portfolio health metrics and triggering executive escalation protocols for underperforming initiatives 2, 9.' },
  { id: 'c16', name: 'Assurance Management', domain: 'Performance', zone: 'Performance', icon: '🛡️', description: 'Conducting independent audits of execution health and providing objective recovery interventions for high-risk programs 2, 9.' },
  { id: 'c17', name: 'Compliance', domain: 'Performance', zone: 'Performance', icon: '📜', description: 'Enforcing strict adherence to internal governance standards, industry frameworks, and global regulatory mandates 2, 9.' },
  { id: 'c18', name: 'Categorisation Management', domain: 'Performance', zone: 'Performance', icon: '🏷️', description: 'Standardizing the taxonomy of the portfolio—including strategic themes, investment types, and metadata—to enable unified enterprise reporting.' },
  
  // Operating Model
  { id: 'om1', name: 'People & Practices', domain: 'Operating Model', zone: 'Operating Model', icon: '🤝', description: 'Establishes how work is performed.\nThe skills, behaviours, and operating rhythms required to execute portfolio and delivery management effectively.\nIncludes human execution only such as training, delivery disciplines, governance cadence, planning cycles, review ceremonies, and performance culture.\nExcludes technology systems (Tooling & Integrations), organisational reporting lines and accountability (Organisation Structure), defined workflows and processes (Journeys & Agents), and data, analytics, metrics, and insights (Data, Context & Decision Intelligence).' },
  { id: 'om2', name: 'Tooling & Integrations', domain: 'Operating Model', zone: 'Operating Model', icon: '⚙️', description: 'Establishes what technology systems and APIs enable execution.\nIncludes SPM/PPM platforms, delivery tooling, integrations, AI agent platforms, workflow automation technology, security, and identity controls.\nExcludes data, analytics, metrics, and insights (Data, Context & Decision Intelligence), workflows and agent behaviours (Journeys & Agents), organisational accountability (Organisation Structure), and human practices (People & Practices).' },
  { id: 'om3', name: 'Data, Context & Decision Intelligence', domain: 'Operating Model', zone: 'Operating Model', icon: '🧠', description: 'Establishes what information informs execution, AI agents, and decision-making.\nThe governed data assets, contextual signals, metrics, analytics, and insight outputs required to support planning, prioritisation, portfolio oversight, and value optimisation.\nIncludes portfolio data models, financial and resource data, delivery metrics, performance metrics, forecasts, predictive analytics, scenario outputs, dashboards, reporting, semantic definitions, and data governance.\nExcludes technology platforms and integrations (Tooling & Integrations), workflows and processes (Journeys & Agents), organisational accountability (Organisation Structure), and human practices (People & Practices).' },
  { id: 'om4', name: 'Journeys & Agents', domain: 'Operating Model', zone: 'Operating Model', icon: '🗺️', description: 'Establishes how work flows from trigger to outcome.\nThe standardised portfolio and delivery workflows executed by colleagues and digital agents from initiation through to value realisation.\nIncludes idea-to-investment, investment-to-delivery, delivery-to-value workflows, stage gates, process control points, and agent-supported processes.\nExcludes decision insight and analytics (Data, Context & Decision Intelligence), technology systems (Tooling & Integrations), organisational accountability (Organisation Structure), and human skillsets and practices (People & Practices).' },
  { id: 'om5', name: 'Organisation Structure', domain: 'Operating Model', zone: 'Operating Model', icon: '🏗️', description: 'Establishes who is accountable.\nThe formal allocation of accountability for strategy, portfolio, and delivery outcomes through reporting lines and ownership boundaries.\nIncludes roles, RACI, portfolio ownership, PMO structures, governance bodies, value stream ownership, and funding accountability.\nExcludes how work is performed (People & Practices), workflows and processes (Journeys & Agents), technology systems (Tooling & Integrations), and data, analytics, metrics, and insights (Data, Context & Decision Intelligence).' },
];

const GOVERNANCE_LEVELS = [
  { id: 'g0', name: 'Group Portfolio', level: 'Level 0', width: '60%' },
  { id: 'g1', name: 'Businesses & Functions', level: 'Level 1', width: '68%' },
  { id: 'g2', name: 'Platforms, Products & Programmes', level: 'Level 2', width: '76%' },
  { id: 'g3', name: 'Sub-Value Streams & Projects', level: 'Level 3', width: '84%' },
  { id: 'g4', name: 'Trackable Investments', level: 'Level 4', width: '92%' },
  { id: 'g5', name: 'Delivery Teams & Pods', level: 'Level 5', width: '100%' }
];

const Q3_WEIGHTS = [2, 1, 1, 2, 1, 2, 3]; // Total = 12

export default function App() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [priorities, setPriorities] = useState<Record<string, number | null>>({});
  const [assessments, setAssessments] = useState<Record<string, AssessmentData>>({});
  const [activeAssessmentId, setActiveAssessmentId] = useState<string | null>(null);

  const activeCap = useMemo(() => 
    CAPABILITIES.find(c => c.id === activeAssessmentId),
    [activeAssessmentId]
  );

  const handleAssessmentChange = (id: string, field: keyof AssessmentData, value: number) => {
    setAssessments(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || { q1: 0, q2: 1, q3: 0 }),
        [field]: value
      }
    }));
  };

  const handleQ3Toggle = (id: string, stepIndex: number) => {
    const current = assessments[id]?.q3 || 0;
    const bit = 1 << stepIndex;
    const newVal = current ^ bit;
    handleAssessmentChange(id, 'q3', newVal);
  };

  const getQ3WeightedScore = (val: number) => {
    let totalWeight = 0;
    for (let i = 0; i < 7; i++) {
      if ((val >> i) & 1) totalWeight += Q3_WEIGHTS[i];
    }
    return totalWeight;
  };

  const getQ3Count = (val: number) => {
    let count = 0;
    for (let i = 0; i < 7; i++) {
      if ((val >> i) & 1) count++;
    }
    return count;
  };

  const toggleSelection = (id: string) => {
    // For Governance levels (start with 'g')
    if (id.startsWith('g')) {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      setSelectedIds(newSet);
    }
  };

  const handlePriorityChange = (id: string, value: string) => {
    const num = value === '' ? null : parseInt(value, 10);
    setPriorities(prev => ({
      ...prev,
      [id]: num
    }));
  };

  const clearAll = () => {
    setSelectedIds(new Set());
    setPriorities({});
    setAssessments({});
  };

  const toggleAll = () => {
    const totalItems = CAPABILITIES.length + GOVERNANCE_LEVELS.length;
    const currentSelectedCount = selectedIds.size + Object.values(priorities).filter(p => p !== null).length;
    
    if (currentSelectedCount === totalItems) {
      clearAll();
    } else {
      const allGovIds = GOVERNANCE_LEVELS.map(g => g.id);
      setSelectedIds(new Set(allGovIds));
      
      const allCapPriorities: Record<string, number> = {};
      CAPABILITIES.forEach(c => {
        allCapPriorities[c.id] = 1; // Default priority 1 when selecting all
      });
      setPriorities(allCapPriorities);
    }
  };

  const allSelected = (selectedIds.size + Object.values(priorities).filter(p => p !== null).length) === (CAPABILITIES.length + GOVERNANCE_LEVELS.length);

  const exportToCSV = () => {
    const prioritisedCaps = CAPABILITIES.filter(c => priorities[c.id] !== null);
    
    const calculateScore = (data: AssessmentData) => {
      const q1Pct = (data.q1 / 10) * 100;
      const q2Pct = ((data.q2 - 1) / 3) * 100;
      const q3Pct = (getQ3WeightedScore(data.q3) / 12) * 100;
      return (q1Pct + q2Pct + q3Pct) / 3;
    };

    const csvContent = [
      ['ID', 'Zone', 'Domain', 'Capability', 'Priority', 'Assessment Score (%)', 'Q1 (Repeatability %)', 'Q2 (Maturity %)', 'Q3 (Understanding %)', 'Description'],
      ...prioritisedCaps.map(c => {
        const assessment = assessments[c.id];
        const q1Pct = assessment ? (assessment.q1 / 10) * 100 : 0;
        const q2Pct = assessment ? ((assessment.q2 - 1) / 3) * 100 : 0;
        const q3Pct = assessment ? (getQ3WeightedScore(assessment.q3) / 12) * 100 : 0;
        const avgScore = assessment ? calculateScore(assessment).toFixed(2) : 'N/A';
        
        return [
          `"${c.id}"`, 
          `"${c.zone}"`, 
          `"${c.domain}"`, 
          `"${c.name}"`, 
          `"${priorities[c.id]}"`,
          `"${avgScore}%"`,
          `"${q1Pct.toFixed(2)}%"`,
          `"${q2Pct.toFixed(2)}%"`,
          `"${q3Pct.toFixed(2)}%"`,
          `"${c.description.replace(/"/g, '""')}"`
        ];
      }),
      ...GOVERNANCE_LEVELS.filter(g => selectedIds.has(g.id)).map((g) => [
        `"${g.id}"`,
        `"Governance"`,
        `"Governance"`,
        `"${g.name}"`,
        `"N/A"`,
        `"N/A"`,
        `"N/A"`,
        `"N/A"`,
        `"N/A"`,
        `"${g.level}"`
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'selected_capabilities.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderNode = (id: string) => {
    const cap = CAPABILITIES.find(c => c.id === id);
    if (!cap) return null;
    
    const priority = priorities[id] ?? 0;
    const isSelected = priority > 0;
    const assessment = assessments[id];
    
    const q1Pct = assessment ? (assessment.q1 / 10) * 100 : 0;
    const q2Pct = assessment ? ((assessment.q2 - 1) / 3) * 100 : 0;
    const q3Pct = assessment ? (getQ3WeightedScore(assessment.q3) / 12) * 100 : 0;
    
    const calculateScore = (data: AssessmentData) => {
      const p1 = (data.q1 / 10) * 100;
      const p2 = ((data.q2 - 1) / 3) * 100;
      const p3 = (getQ3WeightedScore(data.q3) / 12) * 100;
      return (p1 + p2 + p3) / 3;
    };

    const avgScore = assessment ? calculateScore(assessment).toFixed(0) : null;
    
    return (
      <div 
        key={id}
        className={`node capability-node ${isSelected ? 'is-prioritised' : ''} ${cap.isExecutionOnly ? 'delivery-mgmt' : ''} ${cap.isPerfIndicator ? 'perf-indicator' : ''}`}
        title={cap.description}
      >
        <div className="flex justify-between items-center w-full mb-1">
          <span className="text-xl opacity-100">{cap.icon}</span>
          <button 
            className="assess-btn"
            onClick={(e) => { e.stopPropagation(); setActiveAssessmentId(id); }}
          >
            Assess
          </button>
          <input 
            type="number" 
            className="priority-input" 
            value={priority === 0 ? '' : priority} 
            onChange={(e) => handlePriorityChange(id, e.target.value)}
            placeholder="0"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <span className="leading-tight font-medium mb-0 text-center text-[12px]">{cap.name}</span>
        
        {avgScore !== null && (
          <div className="flex flex-col items-center mt-auto w-full">
            <div className="flex flex-col items-center">
              <div className="assessment-badge">
                {avgScore}%
              </div>
              <div className="flex gap-1 mt-1 text-[7px] opacity-70 font-bold uppercase tracking-tighter">
                <span>R:{q1Pct.toFixed(0)}%</span>
                <span>M:{q2Pct.toFixed(0)}%</span>
                <span>U:{q3Pct.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050606] p-4 md:p-8 flex justify-start lg:justify-center overflow-auto">
      <div className="a3-canvas shrink-0 my-auto">
        {/* Header */}
        <div className="header-area">
           <h1>
             Enterprise Product & Programme Performance Ecosystem
           </h1>
           <div className="flex items-center gap-4">
             <button className="action-btn flex items-center gap-2" onClick={toggleAll}>
               <CheckSquare size={16} /> {allSelected ? 'Deselect All' : 'Select All'}
             </button>
             <button className="action-btn flex items-center gap-2 text-red-400 border-red-400/30 hover:bg-red-400/10" onClick={clearAll}>
               <X size={16} /> Clear All
             </button>
             <button className="action-btn flex items-center gap-2" onClick={exportToCSV}>
               <Download size={16} /> Export to CSV
             </button>
             <a href="https://www.3pmo.com" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity ml-4">
               <img src="/Logo.png" alt="3PMO Logo" className="w-20 h-auto" />
             </a>
           </div>
        </div>

        {/* Architecture Grid */}
        <div className="architecture-grid relative">
           
           {/* Left: Governance Levels */}
           <div className="panel panel-gov-tint gov-levels-container z-10">
             <div className="zone-header header-governance">Governance</div>
             <div className="flex flex-col items-center justify-between h-full w-full gap-2 mt-2">
               {GOVERNANCE_LEVELS.map((gov) => {
                 const isSelected = selectedIds.has(gov.id);
                 return (
                   <div 
                     key={gov.id} 
                     className={`gov-level ${gov.name === 'Delivery Teams & Pods' ? 'execution' : ''} ${isSelected ? 'is-checked' : ''}`}
                     style={{ width: gov.width }}
                     onClick={() => toggleSelection(gov.id)}
                   >
                     <span className="text-[#7F8589] text-[10px] font-bold uppercase tracking-wider mb-1">{gov.level}</span>
                     <span className="font-semibold text-sm flex flex-col items-center text-center gap-1">
                       {gov.name}
                       {gov.name === 'Delivery Teams & Pods' && <span className="flex gap-2 text-lg mt-1"><span>👥</span><span>🤖</span></span>}
                     </span>
                     <div className="tick-box"></div>
                   </div>
                 );
               })}
             </div>
           </div>

           {/* Center: Zone 1 */}
           <div className="panel panel-strat-tint z-10">
             <div className="zone-header header-strategy">Strategy Execution</div>
             <div className="zone-1-grid">
               
               {/* Domain 1: Strategy Alignment */}
               <div className="domain-row">
                 <div className="domain-title">Strategy Alignment</div>
                 <div className="nodes-wrapper">
                   {renderNode('c1')}
                   {renderNode('c3')}
                   {renderNode('c4')}
                   {renderNode('c2')}
                 </div>
               </div>

               {/* Domain 2: Risk & Plan Management */}
               <div className="domain-row">
                 <div className="domain-title">Risk & Plan Management</div>
                 <div className="nodes-wrapper">
                   {renderNode('c5')}
                   {renderNode('c6')}
                   {renderNode('c7')}
                   {renderNode('c8')}
                   {renderNode('c9')}
                 </div>
               </div>

               {/* Domain 3: Design & Delivery Management */}
               <div className="domain-row relative">
                 <div className="domain-title">Design & Delivery Management</div>
                 <div className="flex flex-col h-full">
                   <div className="nodes-wrapper mb-4">
                     {renderNode('c10')}
                     {renderNode('c11')}
                     {renderNode('c12')}
                     {renderNode('c13')}
                   </div>
                   <div className="mt-auto flex justify-end border-t border-[#3a3a3d] pt-4 relative">
                     <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" style={{ overflow: 'visible' }}>
                       {/* Green dotted line from Delivery Teams & Pods to Delivery Management */}
                       <line x1="-65" y1="calc(50% + 8px)" x2="75%" y2="calc(50% + 8px)" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
                     </svg>
                     <div className="w-1/4 relative z-40">
                       {renderNode('c14')}
                     </div>
                   </div>
                 </div>
               </div>

             </div>
           </div>

           {/* Middle Column: Connections & Forecast */}
           <div className="relative flex flex-col z-20">
             <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
               {/* Target Line: orange, from Strategy Alignment to Performance Indicator */}
               <line x1="-35" y1="18%" x2="140" y2="18%" stroke="#FF9E1B" strokeWidth="2" style={{ filter: 'drop-shadow(0px 0px 4px rgba(255,158,27,0.8))' }} />
             </svg>

             <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
               {/* Plan Line: curved, white, from Risk & Plan Management to Forecast Node */}
               <path d="M -29.2 50 C -10 50, 10 34, 50 34" stroke="white" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" style={{ filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.8))' }} />

               {/* Actual Line: curved, white, from Delivery Management to Forecast Node */}
               <path d="M -29.2 88 C -10 88, 10 34, 50 34" stroke="white" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" style={{ filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.8))' }} />
               
               {/* Forecast to Performance Indicator: orange, from Forecast Node to Performance Indicator */}
               <path d="M 50 34 C 80 34, 90 18, 116.7 18" stroke="#FF9E1B" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" style={{ filter: 'drop-shadow(0px 0px 4px rgba(255,158,27,0.8))' }} />
             </svg>
             
             {/* Text Labels with Backgrounds */}
             <div className="absolute left-[-29.2px] top-[48%] transform -translate-x-1/2 -translate-y-1/2 bg-[#050606] px-1 text-white text-[11px] font-bold uppercase tracking-wider z-30">
               Plan
             </div>
             <div className="absolute left-[19%] top-[46%] transform -translate-x-1/2 -translate-y-1/2 bg-[#050606] px-1 text-white text-[11px] font-bold uppercase tracking-wider z-30">
               Actual
             </div>

             {/* Target Node */}
             <div className="absolute left-1/2 top-[18%] transform -translate-x-1/2 -translate-y-1/2 bg-[#FF9E1B] border-2 border-[#FF9E1B] rounded-md px-4 py-2 text-[#050606] text-xs font-bold z-10 shadow-[0_0_15px_rgba(255,158,27,0.4)] uppercase tracking-wider">
               Target
             </div>

             {/* Forecast Node */}
             <div className="absolute left-1/2 top-[34%] transform -translate-x-1/2 -translate-y-1/2 bg-[#FF9E1B] border-2 border-[#FF9E1B] rounded-md px-4 py-2 text-[#050606] text-xs font-bold z-10 shadow-[0_0_15px_rgba(255,158,27,0.4)] uppercase tracking-wider">
               Forecast
             </div>
           </div>

           {/* Right: Zone 2 */}
           <div className="panel panel-perf-tint zone-2-panel z-10">
             <div className="zone-header header-performance">Performance</div>
             <div className="nodes-wrapper h-full">
               {renderNode('c15')}
               {renderNode('c16')}
               {renderNode('c17')}
               {renderNode('c18')}
             </div>
           </div>
        </div>

        {/* Bottom: Zone 3 */}
        <div className="panel panel-om-tint zone-3-panel z-10">
           <div className="zone-header header-operating">Operating Model</div>
           <div className="nodes-wrapper w-full mt-2">
             {renderNode('om1')}
             {renderNode('om2')}
             {renderNode('om3')}
             {renderNode('om4')}
             {renderNode('om5')}
           </div>
        </div>

        {/* Assessment Modal */}
        {activeCap && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#18181b] border border-[#3f3f46] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-[#3f3f46] flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{activeCap.icon}</span>
                    <h2 className="text-2xl font-bold text-white">{activeCap.name}</h2>
                  </div>
                  <p className="text-[#a1a1aa] text-sm leading-relaxed whitespace-pre-line">
                    {activeCap.description}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveAssessmentId(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} className="text-[#a1a1aa]" />
                </button>
              </div>

              <div className="p-6 space-y-10">
                {/* Question 1 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="text-[#7CC170]" size={20} />
                    <h3 className="text-lg font-semibold text-white">Question 1: How repeatable is this Journey?</h3>
                    <span className="ml-auto bg-[#7CC170] text-[#050606] px-2 py-0.5 rounded font-bold">
                      {((assessments[activeCap.id]?.q1 || 0) / 10 * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      step="1"
                      className="w-full accent-[#7CC170] cursor-pointer"
                      value={assessments[activeCap.id]?.q1 || 0}
                      onChange={(e) => handleAssessmentChange(activeCap.id, 'q1', parseInt(e.target.value, 10))}
                    />
                    <div className="flex justify-between mt-2 text-[10px] uppercase tracking-widest font-bold text-[#71717a]">
                      <span>High Flexibility - Just in Case</span>
                      <span>Highly Repetitive - Just in Time</span>
                    </div>
                  </div>
                </div>

                {/* Question 2 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-[#7CC170]" size={20} />
                    <h3 className="text-lg font-semibold text-white">Question 2: How mature is this Journey?</h3>
                    <span className="ml-auto bg-[#7CC170] text-[#050606] px-2 py-0.5 rounded font-bold">
                      {(((assessments[activeCap.id]?.q2 || 1) - 1) / 3 * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="4" 
                      step="1"
                      className="w-full accent-[#7CC170] cursor-pointer"
                      value={assessments[activeCap.id]?.q2 || 1}
                      onChange={(e) => handleAssessmentChange(activeCap.id, 'q2', parseInt(e.target.value, 10))}
                    />
                    <div className="grid grid-cols-4 mt-2 text-[9px] uppercase tracking-tighter font-bold text-[#71717a] text-center">
                      <span>Never Run Before</span>
                      <span>Run in Production &lt; 3 times</span>
                      <span>Run in Production 3 &lt; 5</span>
                      <span>Run in Production more than 5 times</span>
                    </div>
                  </div>
                </div>

                {/* Question 3 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="text-[#7CC170]" size={20} />
                    <h3 className="text-lg font-semibold text-white">Question 3: How well understood is this Journey?</h3>
                    <span className="ml-auto bg-[#7CC170] text-[#050606] px-2 py-0.5 rounded font-bold">
                      {(getQ3WeightedScore(assessments[activeCap.id]?.q3 || 0) / 12 * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'Trigger Defined',
                      'UI Controls Defined',
                      'API Defined',
                      'Critical Data Defined',
                      'Agentic Context Defined',
                      'Insight Defined',
                      'Decision or Action Defined'
                    ].map((step, idx) => {
                      const isTicked = ((assessments[activeCap.id]?.q3 || 0) >> idx) & 1;
                      return (
                        <div 
                          key={step}
                          onClick={() => handleQ3Toggle(activeCap.id, idx)}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isTicked 
                              ? 'bg-[#7CC170]/10 border-[#7CC170] text-white' 
                              : 'bg-[#27272a] border-[#3f3f46] text-[#a1a1aa] hover:border-[#52525b]'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isTicked ? 'bg-[#7CC170] border-[#7CC170]' : 'border-[#52525b]'
                          }`}>
                            {isTicked && <CheckSquare size={14} className="text-[#050606]" />}
                          </div>
                          <span className="text-xs font-medium">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-[#3f3f46] bg-[#09090b] rounded-b-xl">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-[#a1a1aa]">
                    <span className="font-bold text-white">Score Calculation:</span> Average of Question Percentages
                    <div className="text-[10px] mt-1 italic space-y-1">
                      <div>Q1: {((assessments[activeCap.id]?.q1 || 0) / 10 * 100).toFixed(0)}% | Q2: {(((assessments[activeCap.id]?.q2 || 1) - 1) / 3 * 100).toFixed(0)}% | Q3: {(getQ3WeightedScore(assessments[activeCap.id]?.q3 || 0) / 12 * 100).toFixed(0)}%</div>
                      <div className="text-[#7CC170] font-bold">
                        Total: {
                          ((
                            ((assessments[activeCap.id]?.q1 || 0) / 10 * 100) + 
                            (((assessments[activeCap.id]?.q2 || 1) - 1) / 3 * 100) + 
                            (getQ3WeightedScore(assessments[activeCap.id]?.q3 || 0) / 12 * 100)
                          ) / 3).toFixed(2)
                        }%
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveAssessmentId(null)}
                    className="bg-[#7CC170] text-[#050606] px-6 py-2 rounded-lg font-bold hover:bg-[#6ab05f] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
