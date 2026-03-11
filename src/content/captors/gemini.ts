import { BaseCaptor, type CaptureCallback } from './base';

export class GeminiCaptor extends BaseCaptor {
  source = 'gemini' as const;
  private observer: MutationObserver | null = null;

  constructor(cb: CaptureCallback) { super(cb); }

  attach(): void {
    this.observer = new MutationObserver(() => this.tryBind());
    this.observer.observe(document.body, { childList: true, subtree: true });
    this.tryBind();
  }

  private tryBind(): void {
    const btn = document.querySelector<HTMLButtonElement>('button.send-button, [aria-label="Send message"]');
    if (!btn || btn.dataset['pv_bound']) return;
    btn.dataset['pv_bound'] = '1';
    btn.addEventListener('click', () => {
      const ta = document.querySelector<HTMLElement>('.ql-editor, [contenteditable="true"]');
      if (ta) this.emit(ta.innerText || '');
    }, true);
  }

  detach(): void { this.observer?.disconnect(); }
}
