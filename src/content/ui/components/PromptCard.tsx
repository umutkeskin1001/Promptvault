import { usePVStore } from '../store';
import { SOURCE_COLORS, SOURCE_LABELS } from '../../../shared/constants';
import type { Prompt } from '../../../shared/types';
import React from 'react';

interface Props { prompt: Prompt; }

export function PromptCard({ prompt }: Props) {
  const { setEditingId, setTemplateId, setPrompts, addToast } = usePVStore();

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.content);
    // Also try to paste into active textarea on the host page
    const ta = document.activeElement as HTMLTextAreaElement | null;
    if (ta && (ta.tagName === 'TEXTAREA' || ta.contentEditable === 'true')) {
      if (ta.tagName === 'TEXTAREA') {
        ta.value = prompt.content;
      } else {
        ta.innerText = prompt.content;
      }
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    }
    addToast({ type: 'success', message: 'Copied to clipboard!' });
    // Increment usage count
    chrome.runtime.sendMessage({
      type: 'UPDATE_PROMPT',
      payload: { id: prompt.id, patch: { usageCount: prompt.usageCount + 1 } }
    });
  }

  function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    chrome.runtime.sendMessage({
      type: 'UPDATE_PROMPT',
      payload: { id: prompt.id, patch: { isFavorite: !prompt.isFavorite } }
    }, () => {
      chrome.runtime.sendMessage({ type: 'GET_ALL' }, (res) => {
        if (res?.prompts) usePVStore.getState().setPrompts(res.prompts);
      });
    });
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this prompt?')) return;
    chrome.runtime.sendMessage({ type: 'DELETE_PROMPT', payload: { id: prompt.id } }, () => {
      chrome.runtime.sendMessage({ type: 'GET_ALL' }, (res) => {
        if (res?.prompts) usePVStore.getState().setPrompts(res.prompts);
      });
    });
  }

  const srcColor = SOURCE_COLORS[prompt.source] ?? '#7C3AED';

  return (
    <div
      className={`pv-card ${prompt.isPinned ? 'pinned' : ''}`}
      onClick={() => prompt.isTemplate ? setTemplateId(prompt.id) : setEditingId(prompt.id)}
    >
      <div className="pv-card-header">
        <span className="pv-card-title">
          {prompt.isPinned && '📌 '}
          {prompt.isTemplate && '🧩 '}
          {prompt.title}
        </span>
      </div>

      <p className="pv-card-preview">{prompt.content}</p>

      <div className="pv-card-footer">
        <span
          className="pv-source-badge"
          style={{ background: srcColor + '22', color: srcColor }}
        >
          {SOURCE_LABELS[prompt.source]}
        </span>
        {prompt.tags.slice(0, 3).map(t => (
          <span key={t} className="pv-tag">#{t}</span>
        ))}
        {prompt.usageCount > 0 && (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
            ×{prompt.usageCount}
          </span>
        )}
      </div>

      {/* Hover actions */}
      <div className="pv-card-actions">
        <button className="pv-action-btn" title="Copy" onClick={handleCopy}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button className={`pv-action-btn favorite ${prompt.isFavorite ? 'active' : ''}`} title="Favorite" onClick={handleFavorite}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill={prompt.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
        </button>
        <button className="pv-action-btn delete" title="Delete" onClick={handleDelete}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
