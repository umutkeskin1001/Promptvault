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
    const h = () => {
      const editor = document.querySelector<HTMLElement>('.ProseMirror');
      if (editor) this.emit(editor.innerText || '');
    };
    btn.addEventListener('click', h, true);

    const editor = document.querySelector<HTMLElement>('.ProseMirror');
    if (editor && !editor.dataset['pv_bound']) {
      editor.dataset['pv_bound'] = '1';
      editor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
          setTimeout(h, 0);
        }
      }, true);
    }
  }

  detach(): void { this.observer?.disconnect(); }
}
