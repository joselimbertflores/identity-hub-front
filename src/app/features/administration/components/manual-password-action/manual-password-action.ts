import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { toDataURL } from 'qrcode';

import { PasswordActionManualDetails } from '../../interfaces';

type CopyTarget = 'code' | 'link';

@Component({
  selector: 'app-manual-password-action',
  imports: [DatePipe, ButtonModule, MessageModule],
  templateUrl: './manual-password-action.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualPasswordAction {
  readonly delivery = input.required<PasswordActionManualDetails>();
  readonly qrDataUrl = signal<string | null>(null);
  readonly copied = signal<CopyTarget | null>(null);
  readonly copyError = signal(false);

  constructor() {
    effect(() => {
      const actionUrl = this.delivery().actionUrl;
      this.qrDataUrl.set(null);
      void toDataURL(actionUrl, { width: 180, margin: 1, errorCorrectionLevel: 'M' })
        .then((dataUrl) => this.qrDataUrl.set(dataUrl))
        .catch(() => this.qrDataUrl.set(null));
    });
  }

  async copy(value: string, target: CopyTarget): Promise<void> {
    this.copied.set(null);
    this.copyError.set(false);
    try {
      await navigator.clipboard.writeText(value);
      this.copied.set(target);
      window.setTimeout(() => {
        if (this.copied() === target) this.copied.set(null);
      }, 2500);
    } catch {
      this.copyError.set(true);
    }
  }
}
