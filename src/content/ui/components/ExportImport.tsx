import React from 'react';
import { usePVStore } from '../store';

export function ExportImport() {
  const { addToast } = usePVStore();

  async function handleExport() {
    chrome.runtime.sendMessage({ type: 'GET_ALL' }, (res) => {
      const json = JSON.stringify(res, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptvault-export-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast({ type: 'success', message: 'Export complete!' });
    });
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      chrome.runtime.sendMessage({ type: 'IMPORT_DATA', payload: { json: text } }, (res) => {
        if (res?.ok) addToast({ type: 'success', message: 'Import successful!' });
        else addToast({ type: 'error', message: 'Import failed — invalid file' });
      });
    };
    input.click();
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button className="pv-btn pv-btn-ghost" onClick={handleExport} style={{ flex: 1, justifyContent: 'center' }}>
        ↓ Export JSON
      </button>
      <button className="pv-btn pv-btn-ghost" onClick={handleImport} style={{ flex: 1, justifyContent: 'center' }}>
        ↑ Import JSON
      </button>
    </div>
  );
}
