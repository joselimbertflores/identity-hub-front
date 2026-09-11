import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { UpperCasePipe } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import {
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';

import { ApplicationResponse } from '../../interfaces';

export interface ClientSecretDialogContext {
  application: ApplicationResponse;
  clientSecret: string;
}

@Component({
  selector: 'app-client-secret-dialog',
  imports: [
    ClipboardModule,
    UpperCasePipe,
    NgIcon,
    HlmButtonImports,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
  ],
  host: { class: 'flex flex-col gap-4' },
  template: `
    <hlm-dialog-header>
      <h2 hlmDialogTitle>Nuevo secreto generado</h2>
    </hlm-dialog-header>
    <div class="flex flex-col gap-2">
      <p class="m-0 text-sm text-muted-foreground">
        Copia el secreto generado para
        <span class="font-medium text-foreground">{{ application.name | uppercase }}</span
        >. Por seguridad, no volverá a mostrarse.
      </p>

      <div class="rounded-lg border border-border bg-muted/50 p-3">
        <code class="break-all text-sm">
          {{ clientSecret }}
        </code>
      </div>

      <div class="flex justify-end">
        <button
          hlmBtn
          size="sm"
          type="button"
          [variant]="copied() ? 'default' : 'secondary'"
          [cdkCopyToClipboard]="clientSecret"
          (cdkCopyToClipboardCopied)="onClientSecretCopied($event)"
        >
          <ng-icon [name]="copied() ? 'lucideCheck' : 'lucideCopy'" />
          {{ copied() ? 'Copiado' : 'Copiar' }}
        </button>
      </div>
    </div>
    <hlm-dialog-footer>
      <button hlmBtn type="button" (click)="close()">Entendido</button>
    </hlm-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class ClientSecretDialog {
  private readonly dialogRef = inject<BrnDialogRef<void>>(BrnDialogRef);
  private readonly context = injectBrnDialogContext<ClientSecretDialogContext>();

  readonly clientSecret = this.context.clientSecret;
  readonly application = this.context.application;
  readonly copied = signal(false);

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
