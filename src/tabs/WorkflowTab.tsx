export default function WorkflowTab() {
  return (
    <div className="workflow-tab">
      <div className="tab-section-header">
{/* Header Removed */}
        <p className="tab-section-desc">End-to-end AI ecosystem workflow — live interactive diagram.</p>
      </div>
      <div className="workflow-frame-wrap">
        <iframe
          src="/workflow-diagram.html"
          title="Workflow Diagram"
          className="workflow-iframe"
          allowFullScreen
        />
      </div>
    </div>
  );
}
