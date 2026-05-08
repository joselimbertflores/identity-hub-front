import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';

import { AuthDataSource } from '../../../../core';

@Component({
  selector: 'app-welcome-page',
  imports: [TitleCasePipe],
  template: `
    <div class="flex flex-col items-center justify-center h-full p-4 text-center">
      <div class="max-w-2xl">
        <div class="mb-8">
          <i class="pi pi-shield text-primary-600" style="font-size: 2.5rem"></i>
        </div>

        <h1 class="text-xl md:text-2xl font-bold text-surface-900 tracking-tight mb-4">
          Hola,
          <span class="text-primary-600">{{ userFullName | titlecase }}</span>
        </h1>

        <p class="text-sm sm:text-lg text-surface-500 font-medium mb-6 leading-relaxed">
          Su sesión está activa en el Sistema Institucional de Autenticación y Acceso.
        </p>

        <div class="mt-12 pt-8 border-t border-surface-200 flex justify-center">
          <div class="flex items-center gap-2 text-surface-400">
            <i class="pi pi-code"></i>
            <span class="text-sm font-semibold">Versión 1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WelcomePage {
  readonly userFullName = inject(AuthDataSource).user()?.fullName;
}
