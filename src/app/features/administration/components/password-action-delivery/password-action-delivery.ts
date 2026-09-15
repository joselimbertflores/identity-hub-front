import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmAlertImports } from '@spartan-ng/helm/alert';

import { PasswordActionDelivery } from '../../interfaces';

export type PasswordActionContext = 'create' | 'reset' | 'resend';

@Component({
  selector: 'app-password-action-delivery',
  imports: [NgIcon, HlmAlertImports],
  template: `
    <div class="flex flex-col gap-5">
      @if (delivery().status === 'SENT') {
        <div hlmAlert role="status">
          <ng-icon name="lucideCircleCheck" class="text-primary" />
          <div>
            <h3 hlmAlertTitle>Correo enviado</h3>
            <p hlmAlertDescription>{{ emailSuccessMessage() }}</p>
          </div>
        </div>
      } @else {
        <div hlmAlert>
          <ng-icon name="lucideTriangleAlert" />
          <div>
            <h3 hlmAlertTitle>No se pudo enviar el correo</h3>
            <p hlmAlertDescription>{{ emailFailureMessage() }}</p>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordActionDeliveryView {
  readonly delivery = input.required<PasswordActionDelivery>();
  readonly context = input.required<PasswordActionContext>();

  readonly emailSuccessMessage = computed(() => {
    switch (this.context()) {
      case 'create':
        return 'Usuario creado y enlace de configuración enviado al correo registrado.';
      case 'reset':
        return 'La contraseña anterior dejó de funcionar y el enlace para establecer una nueva contraseña fue enviado al correo registrado.';
      case 'resend':
        return 'El enlace anterior fue invalidado y el nuevo enlace fue enviado al correo registrado.';
    }
  });

  readonly emailFailureMessage = computed(() => {
    switch (this.context()) {
      case 'create':
        return 'El usuario fue creado y la acción quedó pendiente, pero no se pudo enviar el correo. Intente reenviar el enlace.';
      case 'reset':
        return 'La contraseña anterior dejó de funcionar y la acción quedó pendiente, pero no se pudo enviar el correo. Intente reenviar el enlace.';
      case 'resend':
        return 'El enlace anterior fue invalidado, pero no se pudo enviar el nuevo correo. Intente reenviar el enlace.';
    }
  });
}
