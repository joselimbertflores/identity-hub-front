import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmAlertImports } from '@spartan-ng/helm/alert';

import { PasswordActionDelivery, PasswordActionManualDetails } from '../../interfaces';
import { ManualPasswordAction } from '../manual-password-action/manual-password-action';

export type PasswordActionContext = 'create' | 'reset' | 'resend';

@Component({
  selector: 'app-password-action-delivery',
  imports: [NgIcon, HlmAlertImports, ManualPasswordAction],
  template: `
    <div class="flex flex-col gap-5">
      @if (emailSent()) {
        <div hlmAlert role="status">
          <ng-icon name="lucideCircleCheck" class="text-primary" />
          <div><h3 hlmAlertTitle>Correo enviado</h3><p hlmAlertDescription>{{ emailSuccessMessage() }}</p></div>
        </div>
      } @else {
        @if (emailFailed()) {
          <div hlmAlert>
            <ng-icon name="lucideTriangleAlert" />
            <div><h3 hlmAlertTitle>No se pudo enviar el correo</h3><p hlmAlertDescription>{{ emailFailureMessage() }}</p></div>
          </div>
        } @else {
          <div hlmAlert role="status">
            <div><h3 hlmAlertTitle>Entrega manual</h3><p hlmAlertDescription>La acción debe entregarse manualmente al usuario.</p></div>
          </div>
        }

        @if (manualDetails(); as details) {
          <app-manual-password-action [delivery]="details" />
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordActionDeliveryView {
  readonly delivery = input.required<PasswordActionDelivery>();
  readonly context = input.required<PasswordActionContext>();
  readonly emailSent = computed(() => {
    const delivery = this.delivery();
    return delivery.method === 'EMAIL' && delivery.status === 'SENT';
  });
  readonly emailFailed = computed(() => {
    const delivery = this.delivery();
    return delivery.method === 'EMAIL' && delivery.status === 'FAILED';
  });

  readonly manualDetails = computed<PasswordActionManualDetails | null>(() => {
    const delivery = this.delivery();
    if (delivery.method === 'MANUAL') {
      const { code, actionUrl, expiresAt } = delivery;
      return { code, actionUrl, expiresAt };
    }
    if (delivery.status === 'FAILED') {
      return { ...delivery.fallback, expiresAt: delivery.expiresAt };
    }
    return null;
  });

  readonly emailSuccessMessage = computed(() => {
    switch (this.context()) {
      case 'create':
        return 'Usuario creado y enlace de configuración enviado al correo registrado.';
      case 'reset':
        return 'La contraseña anterior dejó de funcionar y el enlace de recuperación fue enviado al correo registrado.';
      case 'resend':
        return 'El enlace anterior fue invalidado y el nuevo enlace fue enviado al correo registrado.';
    }
  });

  readonly emailFailureMessage = computed(() => {
    switch (this.context()) {
      case 'create':
        return 'El usuario fue creado, pero no se pudo enviar el correo.';
      case 'reset':
        return 'La contraseña anterior dejó de funcionar, pero no se pudo enviar el correo.';
      case 'resend':
        return 'El enlace anterior fue invalidado, pero no se pudo enviar el correo.';
    }
  });
}
