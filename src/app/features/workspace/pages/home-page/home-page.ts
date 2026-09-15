import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { NgIcon } from '@ng-icons/core';

import { AuthDataSource } from '../../../../core';

@Component({
  selector: 'app-home-page',
  imports: [TitleCasePipe, NgIcon],
  template: `
    <div class="flex flex-col items-center justify-center h-full p-4 text-center">
      <div class="max-w-2xl">
        <div class="mb-8">
          <ng-icon name="lucideShieldCheck" class="text-[length:--spacing(10)] text-primary" />
        </div>

        <h1 class="mb-4 text-xl font-bold tracking-tight text-foreground md:text-2xl">
          Hola,
          <span class="text-primary">{{ userFullName | titlecase }}</span>
        </h1>

        <p class="mb-6 text-sm font-medium leading-relaxed text-muted-foreground sm:text-lg">
          Su sesión está activa en el Sistema de Identidad y Acceso Unificado.
        </p>

        <div class="mt-12 flex justify-center border-t border-border pt-8">
          <div class="flex items-center gap-2 text-muted-foreground">
            <ng-icon name="lucideCodeXml" />
            <span class="text-sm font-semibold">Versión 1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePage {
  readonly userFullName = inject(AuthDataSource).user()?.fullName;
}
