import { Component, inject, signal } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { UpperCasePipe } from '@angular/common';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { ApplicationResponse } from '../../interfaces';

@Component({
  selector: 'app-client-secret-dialog',
  imports: [ButtonModule, ClipboardModule, UpperCasePipe],
  template: `
    <div class="flex flex-col gap-2">
      <p class="m-0 text-sm text-color-secondary">
        Copia el secreto generado para
        <span class="font-medium text-color">{{ application.name | uppercase }}</span
        >. Por seguridad, no volverá a mostrarse.
      </p>

      <div class="rounded-lg border border-surface-200 bg-surface-50 p-3">
        <code class="break-all text-sm">
          {{ clientSecret }}
        </code>
      </div>

      <div class="flex justify-end">
        <p-button
          size="small"
          type="button"
          icon="pi pi-copy"
          [label]="copied() ? 'Copiado' : 'Copiar'"
          [severity]="copied() ? 'success' : 'secondary'"
          [cdkCopyToClipboard]="clientSecret"
          (cdkCopyToClipboardCopied)="onClientSecretCopied($event)"
        />
      </div>
    </div>
    <div class="p-dialog-footer">
      <p-button label="Entendido" (onClick)="close()" />
    </div>
  `,
  providers: [MessageService],
})
export class ClientSecretDialog {
  readonly config = inject(DynamicDialogConfig);
  readonly dialogRef = inject(DynamicDialogRef);
  readonly messageService = inject(MessageService);

  clientSecret = this.config.data.clientSecret;
  application: ApplicationResponse = this.config.data.application;

  copied = signal(false);

  onClientSecretCopied(copied: boolean): void {
    if (!copied) return;

    this.copied.set(true);

    setTimeout(() => {
      this.copied.set(false);
    }, 1500);
  }

  close(): void {
    this.dialogRef.close();
  }
}
