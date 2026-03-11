import { createRoot } from 'react-dom/client';
import React from 'react';
import { createCaptor } from './captors';
import { mountShadowUI } from './ui/mount';
import { Panel } from './ui/Panel';
import { usePVStore } from './ui/store';

// Don't inject if already injected (HMR guard)
if (!document.getElementById('promptvault-host')) {
  const { container, shadowRoot, triggerButton } = mountShadowUI();

  // Mount React panel into shadow root
  const root = createRoot(container);
  root.render(React.createElement(Panel, { shadowRoot }));

  // Wire trigger button
  triggerButton.addEventListener('click', () => {
    usePVStore.getState().toggle();
  });

  // Keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      usePVStore.getState().toggle();
    }
  });

  // Start prompt capture
  const captor = createCaptor((content, source) => {
    chrome.runtime.sendMessage(
      { type: 'SAVE_PROMPT', payload: { content, source, title: '', tags: [], collectionId: null, isFavorite: false, isPinned: false, isTemplate: false, templateVars: [] } },
      (res) => {
        if (res?.duplicate) {
          // Manually send duplicate toast message since it's not saved
          chrome.runtime.sendMessage({ type: 'PROMPT_CAPTURED', payload: { source, isDuplicate: true } });
        }
      }
    );
  });

  captor?.attach();
}
