import React, { useEffect } from 'react';
import { usePVStore } from './store';
import { PromptList } from './components/PromptList';
import { PromptEditor } from './components/PromptEditor';
import { TemplateRunner } from './components/TemplateRunner';
import { ToastSystem } from './components/ToastSystem';
import { Settings } from './components/SettingsView';
import panelCss from './styles/panel.css?inline';
import type { AISource } from '../../shared/types';

interface PanelProps {
  shadowRoot: ShadowRoot;
}

export function Panel({ shadowRoot }: PanelProps) {
  const { isOpen, view, setData, addToast } = usePVStore();

  // Load all data on mount
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_ALL' }, (res) => {
      if (res?.prompts) setData(res.prompts, res.collections, res.settings);
    });
  }, []);

  // Listen for newly captured prompts
  useEffect(() => {
    const handler = (msg: { type: string; payload?: { source: AISource; isDuplicate?: boolean } }) => {
      if (msg.type === 'PROMPT_CAPTURED') {
        if (msg.payload?.isDuplicate) {
          addToast({ type: 'warning', message: 'Similar prompt already exists' });
        } else {
          addToast({ type: 'success', message: `Prompt saved from ${msg.payload?.source ?? 'AI'}` });
          // Refresh list
          chrome.runtime.sendMessage({ type: 'GET_ALL' }, (res) => {
            if (res?.prompts) setData(res.prompts, res.collections, res.settings);
          });
        }
      }
    };
    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  return (
    <>
      <style>{panelCss}</style>
      <div id="pv-panel" className={isOpen ? 'open' : ''}>
        {view === 'list'     && <PromptList />}
        {view === 'editor'   && <PromptEditor />}
        {view === 'template' && <TemplateRunner />}
        {view === 'settings' && <Settings />}
        <ToastSystem />
      </div>
    </>
  );
}
