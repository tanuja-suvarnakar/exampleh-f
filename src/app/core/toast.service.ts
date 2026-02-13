import { Injectable } from '@angular/core';

export interface ToastMessage {
  type: 'success' | 'error';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  messages: ToastMessage[] = [];

  showSuccess(text: string) {
    this.messages.push({ type: 'success', text });
    this.autoDismiss();
  }

  showError(text: string) {
    this.messages.push({ type: 'error', text });
    this.autoDismiss();
  }

  dismiss(index: number) {
    this.messages.splice(index, 1);
  }

  private autoDismiss() {
    const index = this.messages.length - 1;
    setTimeout(() => {
      if (this.messages[index]) {
        this.messages.splice(index, 1);
      }
    }, 4000);
  }
}