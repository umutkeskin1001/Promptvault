import React, { useState, useEffect } from 'react';
import { usePVStore } from '../store';

export function TemplateRunner() {
  const { templateId, prompts, setTemplateId, addToast } = usePVStore();
  const prompt = prompts.find(p => p.id === templateId);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!prompt) return;
    const init: Record<string, string> = {};
    prompt.templateVars.forEach(v => { init[v.key] = v.defaultValue; });
    setValues(init);
  }, [templateId, prompt]);

  if (!prompt) return null;

  const rendered = prompt.content.replace(/\{\{(\w+)\}\}/g, (_, k) => values[k] ?? `{{${k}}}`);

  function handleUse() {
    navigator.clipboard.writeText(rendered);
    addToast({ type: 'success', message: 'Template copied to clipboard!' });
    chrome.runtime.sendMessage({ type: 'UPDATE_PROMPT', payload: { id: prompt!.id, patch: { usageCount: (prompt!.usageCount ?? 0) + 1 } } });
    setTemplateId(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="pv-header">
        <button className="pv-icon-btn" onClick={() => setTemplateId(null)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
        </button>
        <span className="pv-header-title">🧩 {prompt.title}</span>
      </div>
      <div className="pv-editor">
        {prompt.templateVars.map(v => (
          <div key={v.key} className="pv-field">
            <label>{v.label}</label>
            <input className="pv-input" placeholder={v.defaultValue || v.key} value={values[v.key] ?? ''} onChange={e => setValues(vals => ({ ...vals, [v.key]: e.target.value }))} />
          </div>
        ))}
        <div className="pv-field">
          <label>Preview</label>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>
            {rendered}
          </div>
        </div>
        <button className="pv-btn pv-btn-primary" onClick={handleUse} style={{ width: '100%', justifyContent: 'center' }}>
          Copy & Use
        </button>
      </div>
    </div>
  );
}
