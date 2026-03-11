import React from 'react';
import { usePVStore } from '../store';
import { ExportImport } from './ExportImport';
import type { AppSettings } from '../../../shared/types';

export function Settings() {
  const { settings, setView, addToast } = usePVStore();
  if (!settings) return null;

  function update(patch: Partial<AppSettings>) {
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', payload: patch }, () => {
      addToast({ type: 'success', message: 'Settings saved' });
    });
  }

  function handleClearAll() {
    if (!confirm('Are you sure you want to clear ALL data? This cannot be undone.')) return;
    chrome.runtime.sendMessage({ type: 'CLEAR_ALL_DATA' }, () => {
      addToast({ type: 'success', message: 'All data cleared' });
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="pv-header">
        <button className="pv-icon-btn" onClick={() => setView('list')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
        </button>
        <span className="pv-header-title">Settings</span>
      </div>
      <div className="pv-editor">
        <div className="pv-field">
          <label>Auto-capture prompts</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.autoCapture} onChange={e => update({ autoCapture: e.target.checked })} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Automatically save every prompt</span>
          </label>
        </div>
        <div className="pv-field">
          <label>Minimum prompt length ({settings.minLength} chars)</label>
          <input type="range" min={0} max={100} value={settings.minLength}
            style={{ width: '100%' }}
            onChange={e => update({ minLength: Number(e.target.value) })} />
        </div>
        <div className="pv-field">
          <label>Duplicate detection</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={settings.showDuplicateWarning} onChange={e => update({ showDuplicateWarning: e.target.checked })} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Warn when saving similar prompts</span>
          </label>
        </div>
        <div className="pv-field">
          <label>Keyboard Shortcut</label>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-surface)', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)' }}>
            {settings.keyboardShortcut}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Toggle the vault sidebar with this shortcut.
          </p>
        </div>

        <div className="pv-field">
          <label>Data Management</label>
          <ExportImport />
          <button className="pv-btn pv-btn-danger" onClick={handleClearAll} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            Clear All Data
          </button>
        </div>

        <div style={{ marginTop: 'auto', padding: '16px 0', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
          PromptVault v1.0.0 · Open Source
        </div>
      </div>
    </div>
  );
}
