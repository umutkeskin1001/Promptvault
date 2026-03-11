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
    const settings = usePVStore.getState().settings;
    const shortcut = settings?.keyboardShortcut || 'Ctrl+Shift+P';

    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const key = e.key.toUpperCase();

    // Very basic parser for "Ctrl+Shift+P" style strings
    const parts = shortcut.split('+');
    const wantsCtrl = parts.includes('Ctrl');
    const wantsShift = parts.includes('Shift');
    const wantsKey = parts[parts.length - 1].toUpperCase();

    if (isCtrl === wantsCtrl && isShift === wantsShift && key === wantsKey) {
      e.preventDefault();
      usePVStore.getState().toggle();
    }
  });

  // Track last focused element on host page
  document.addEventListener('focusin', () => {
    const active = document.activeElement as HTMLElement;
    if (active && !active.closest('#promptvault-host')) {
      usePVStore.getState().setLastActiveElement(active);
    }
  });

  // Start prompt capture
  const captor = createCaptor((content, source) => {
    chrome.runtime.sendMessage(
      { type: 'SAVE_PROMPT', payload: { content, source, title: '', tags: [], collectionId: null, isFavorite: false, isPinned: false, isTemplate: false, templateVars: [] } },
      (res) => {
        if (res?.duplicate) {
          usePVStore.getState().addToast({ type: 'warning', message: 'Similar prompt already exists' });
        }
      }
    );
  });

  captor?.attach();
}
