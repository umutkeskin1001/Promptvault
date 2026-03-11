import { BaseCaptor, type CaptureCallback } from './base';

export class ClaudeCaptor extends BaseCaptor {
  source = 'claude' as const;
  private observer: MutationObserver | null = null;

  constructor(cb: CaptureCallback) { super(cb); }

  attach(): void {
    this.observer = new MutationObserver(() => this.tryBind());
    this.observer.observe(document.body, { childList: true, subtree: true });
    this.tryBind();
  }

  private tryBind(): void {
    // Claude uses a ProseMirror contenteditable div
    const btn = document.querySelector<HTMLButtonElement>('button[aria-label="Send message"]');
    if (!btn || btn.dataset['pv_bound']) return;
    btn.dataset['pv_bound'] = '1';
    btn.addEventListener('click', () => {
      const editor = document.querySelector<HTMLElement>('.ProseMirror');
      if (editor) this.emit(editor.innerText || '');
    }, true);
  }

  detach(): void { this.observer?.disconnect(); }
}
