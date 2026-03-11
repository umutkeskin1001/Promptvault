import { useMemo } from 'react';
import { usePVStore } from '../store';
import { PromptCard } from './PromptCard';
import { EmptyState } from './EmptyState';
import { SOURCE_LABELS } from '../../../shared/constants';
import type { Prompt } from '../../../shared/types';
import React from 'react';

export function PromptList() {
  const {
    prompts, collections, searchQuery, activeCollectionId,
    activeTag, activeSource, setSearch, setActiveCollection,
    setActiveTag, setActiveSource, setEditingId, setOpen, toggle, setView
  } = usePVStore();

  const allTags = useMemo(() => {
    const s = new Set<string>();
    prompts.forEach(p => p.tags.forEach(t => s.add(t)));
    return [...s];
  }, [prompts]);

  const allSources = useMemo(() => {
    const s = new Set<string>();
    prompts.forEach(p => s.add(p.source));
    return [...s];
  }, [prompts]);

  const filtered = useMemo((): Prompt[] => {
    return prompts
      .filter(p => !activeCollectionId || p.collectionId === activeCollectionId)
      .filter(p => !activeTag || p.tags.includes(activeTag))
      .filter(p => !activeSource || p.source === activeSource)
      .filter(p => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.content.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        return b.createdAt - a.createdAt;
      });
  }, [prompts, activeCollectionId, activeTag, activeSource, searchQuery]);

  return (
    <>
      {/* Header */}
      <div className="pv-header">
        <div className="pv-header-logo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
        </div>
        <span className="pv-header-title">PromptVault</span>
        <span className="pv-header-count">{prompts.length}</span>
        <button className="pv-icon-btn" title="New prompt" onClick={() => setEditingId('__new__')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button className="pv-icon-btn" title="Settings" onClick={() => setView('settings')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <button className="pv-icon-btn" title="Close panel" onClick={toggle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Search */}
      <div className="pv-search-wrap">
        <svg className="pv-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="pv-search"
          placeholder="Search prompts..."
          value={searchQuery}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter chips: sources */}
      {allSources.length > 1 && (
        <div className="pv-chips">
          <button className={`pv-chip ${!activeSource ? 'active' : ''}`} onClick={() => setActiveSource(null)}>
            All
          </button>
          {allSources.map(s => (
            <button key={s} className={`pv-chip ${activeSource === s ? 'active' : ''}`} onClick={() => setActiveSource(activeSource === s ? null : s)}>
              {SOURCE_LABELS[s] ?? s}
            </button>
          ))}
        </div>
      )}

      {/* Tags chips */}
      {allTags.length > 0 && (
        <div className="pv-chips">
          {allTags.map(t => (
            <button key={t} className={`pv-chip ${activeTag === t ? 'active' : ''}`} onClick={() => setActiveTag(activeTag === t ? null : t)}>
              # {t}
            </button>
          ))}
        </div>
      )}

      {/* Body: collections sidebar + list */}
      <div className="pv-body">
        {collections.length > 0 && (
          <div className="pv-sidebar">
            <div
              className={`pv-sidebar-item ${!activeCollectionId ? 'active' : ''}`}
              onClick={() => setActiveCollection(null)}
            >
              <span className="emoji">📋</span> All
            </div>
            {collections.map(c => (
              <div
                key={c.id}
                className={`pv-sidebar-item ${activeCollectionId === c.id ? 'active' : ''}`}
                onClick={() => setActiveCollection(activeCollectionId === c.id ? null : c.id)}
              >
                <span className="emoji">{c.emoji}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pv-list">
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map(p => <PromptCard key={p.id} prompt={p} />)
          )}
        </div>
      </div>
    </>
  );
}
