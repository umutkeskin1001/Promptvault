import React, { useState, useEffect } from 'react';
import { usePVStore } from '../store';
import type { Prompt, TemplateVar } from '../../../shared/types';

export function PromptEditor() {
  const { editingId, prompts, collections, setEditingId, setPrompts, addToast } = usePVStore();
  const isNew = editingId === '__new__';
  const existing = prompts.find(p => p.id === editingId);

  const [title, setTitle]           = useState('');
  const [content, setContent]       = useState('');
  const [tagInput, setTagInput]     = useState('');
  const [tags, setTags]             = useState<string[]>([]);
  const [collectionId, setCollection] = useState<string | null>(null);
  const [isFavorite, setFavorite]   = useState(false);
  const [isPinned, setPinned]       = useState(false);
  const [isTemplate, setTemplate]   = useState(false);
  const [templateVars, setVars]     = useState<TemplateVar[]>([]);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setContent(existing.content);
      setTags(existing.tags);
      setCollection(existing.collectionId);
      setFavorite(existing.isFavorite);
      setPinned(existing.isPinned);
      setTemplate(existing.isTemplate);
      setVars(existing.templateVars);
    } else {
      setTitle(''); setContent(''); setTags([]); setCollection(null);
      setFavorite(false); setPinned(false); setTemplate(false); setVars([]);
    }
  }, [editingId, existing]);

  // Auto-detect template vars from content ({{varName}} syntax)
  useEffect(() => {
    if (!isTemplate) return;
    const matches = [...content.matchAll(/\{\{(\w+)\}\}/g)];
    const keys = [...new Set(matches.map(m => m[1]))];
    setVars(prev => keys.map(key => prev.find(v => v.key === key) ?? { key, label: key, defaultValue: '' }));
  }, [content, isTemplate]);

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(tag)) setTags([...tags, tag]);
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  async function handleSave() {
    if (!content.trim()) { addToast({ type: 'error', message: 'Content cannot be empty' }); return; }
    const autoTitle = title.trim() || content.slice(0, 60) + (content.length > 60 ? '…' : '');
    const payload: Partial<Prompt> = {
      title: autoTitle, content: content.trim(), tags,
      collectionId, isFavorite, isPinned, isTemplate, templateVars,
      source: existing?.source ?? 'manual',
    };

    if (isNew) {
      chrome.runtime.sendMessage({ type: 'SAVE_PROMPT', payload }, (res) => {
        if (res?.duplicate) {
          addToast({ type: 'warning', message: 'Very similar prompt already exists!' });
        } else {
          addToast({ type: 'success', message: 'Prompt saved!' });
          chrome.runtime.sendMessage({ type: 'GET_ALL' }, (r) => {
            if (r?.prompts) setPrompts(r.prompts);
          });
          setEditingId(null);
        }
      });
    } else {
      chrome.runtime.sendMessage({ type: 'UPDATE_PROMPT', payload: { id: editingId!, patch: payload } }, () => {
        addToast({ type: 'success', message: 'Prompt updated!' });
        chrome.runtime.sendMessage({ type: 'GET_ALL' }, (r) => {
          if (r?.prompts) setPrompts(r.prompts);
        });
        setEditingId(null);
      });
    }
  }

  function handleCopy() {
    if (!content.trim()) return;
    navigator.clipboard.writeText(content);
    addToast({ type: 'success', message: 'Copied to clipboard' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="pv-header">
        <button className="pv-icon-btn" onClick={() => setEditingId(null)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
        </button>
        <span className="pv-header-title" style={{ flex: 1 }}>{isNew ? 'New Prompt' : 'Edit Prompt'}</span>
        <button className="pv-icon-btn" title="Copy to clipboard" onClick={handleCopy} style={{ marginRight: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button className="pv-btn pv-btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={handleSave}>Save</button>
      </div>

      <div className="pv-editor">
        {/* Title */}
        <div className="pv-field">
          <label>Title</label>
          <input className="pv-input" placeholder="Auto-generated from content..." value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        {/* Content */}
        <div className="pv-field">
          <label>Prompt {isTemplate && <span style={{ color: 'var(--accent)', marginLeft: 4 }}>· use {'{{var}}'} for variables</span>}</label>
          <textarea className="pv-textarea" rows={8} value={content} onChange={e => setContent(e.target.value)} placeholder="Write or paste your prompt here..." />
        </div>

        {/* Tags */}
        <div className="pv-field">
          <label>Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 10px', cursor: 'text' }}>
            {tags.map(t => (
              <span key={t} className="pv-tag" style={{ cursor: 'pointer' }} onClick={() => setTags(tags.filter(x => x !== t))}>
                #{t} ×
              </span>
            ))}
            <input
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 12, minWidth: 80, fontFamily: 'var(--font-display)' }}
              placeholder={tags.length === 0 ? 'Add tags (Enter or comma)...' : ''}
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>
        </div>

        {/* Collection */}
        {collections.length > 0 && (
          <div className="pv-field">
            <label>Collection</label>
            <select className="pv-input" value={collectionId ?? ''} onChange={e => setCollection(e.target.value || null)}
              style={{ appearance: 'none', cursor: 'pointer' }}>
              <option value="">No collection</option>
              {collections.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </div>
        )}

        {/* Toggles */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: '📌 Pin', val: isPinned, set: setPinned },
            { label: '⭐ Favorite', val: isFavorite, set: setFavorite },
            { label: '🧩 Template', val: isTemplate, set: setTemplate },
          ].map(({ label, val, set }) => (
            <button
              key={label}
              className={`pv-btn ${val ? 'pv-btn-primary' : 'pv-btn-ghost'}`}
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={() => set(!val)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Template vars */}
        {isTemplate && templateVars.length > 0 && (
          <div className="pv-field">
            <label>Template Variables</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {templateVars.map((v, i) => (
                <div key={v.key} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', minWidth: 80 }}>{'{{' + v.key + '}}'}</span>
                  <input className="pv-input" placeholder="Label" value={v.label} style={{ flex: 1 }}
                    onChange={e => setVars(vars => vars.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                  <input className="pv-input" placeholder="Default" value={v.defaultValue} style={{ flex: 1 }}
                    onChange={e => setVars(vars => vars.map((x, j) => j === i ? { ...x, defaultValue: e.target.value } : x))} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
