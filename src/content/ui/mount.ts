// Mounts the Shadow DOM host and returns the React root container.
// The shadow root isolates ALL our styles from the host page.

export interface MountResult {
  container: HTMLElement;   // React mounts into this
  shadowRoot: ShadowRoot;
  triggerButton: HTMLButtonElement;
  cleanup: () => void;
}

export function mountShadowUI(): MountResult {
  // Host element
  const host = document.createElement('div');
  host.id = 'promptvault-host';
  Object.assign(host.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    zIndex: '2147483647',
    pointerEvents: 'none',
    fontFamily: 'inherit',
  });
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // Inject Google Fonts into shadow root
  const fonts = document.createElement('link');
  fonts.rel = 'stylesheet';
  fonts.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Geist+Mono:wght@400;500&display=swap';
  shadow.appendChild(fonts);

  // Floating trigger button
  const btn = document.createElement('button');
  btn.id = 'pv-trigger';
  btn.title = 'PromptVault (Ctrl+Shift+P)';
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14,2 14,8 20,8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="16" y2="17"/>
      <line x1="8" y1="9" x2="10" y2="9"/>
    </svg>
  `;
  Object.assign(btn.style, {
    position: 'fixed',
    top: '16px',
    right: '16px',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 24px rgba(124,58,237,0.5)',
    transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease',
    pointerEvents: 'auto',
    zIndex: '2147483647',
  });
  btn.onmouseenter = () => {
    btn.style.transform = 'scale(1.1)';
    btn.style.boxShadow = '0 6px 32px rgba(124,58,237,0.7)';
  };
  btn.onmouseleave = () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0 4px 24px rgba(124,58,237,0.5)';
  };
  shadow.appendChild(btn);

  // React container
  const container = document.createElement('div');
  container.id = 'pv-panel-root';
  container.style.pointerEvents = 'auto';
  shadow.appendChild(container);

  return {
    container,
    shadowRoot: shadow,
    triggerButton: btn,
    cleanup: () => host.remove(),
  };
}
