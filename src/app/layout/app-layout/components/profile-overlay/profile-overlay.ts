import { TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';

import { AuthDataSource } from '../../../../core';
@Component({
  selector: 'profile-overlay',
  imports: [TitleCasePipe, NgIcon, HlmAvatarImports, HlmButtonImports, HlmPopoverImports],
  template: `
    <hlm-popover
      align="end"
      [state]="open() ? 'open' : 'closed'"
      (stateChanged)="open.set($event === 'open')"
    >
      <button hlmPopoverTrigger hlmBtn variant="ghost" size="icon" aria-label="Abrir perfil">
        <hlm-avatar>
          <span hlmAvatarFallback><ng-icon name="lucideUser" /></span>
        </hlm-avatar>
      </button>
      <hlm-popover-content *hlmPopoverPortal class="w-[300px]">
        <hlm-popover-header class="items-center text-center">
          <hlm-avatar class="size-16">
            <span hlmAvatarFallback><ng-icon name="lucideUser" /></span>
          </hlm-avatar>
          <h2 hlmPopoverTitle>{{ user()?.fullName | titlecase }}</h2>
          <p hlmPopoverDescription>Cuenta institucional</p>
        </hlm-popover-header>
        <div class="mt-3 flex flex-col gap-1 border-t border-border pt-3">
          <button hlmBtn variant="ghost" class="justify-start" type="button" (click)="setting()">
            <ng-icon name="lucideSettings" />
            Configuración
          </button>
          <button hlmBtn variant="ghost" class="justify-start text-destructive" type="button" (click)="logout()">
            <ng-icon name="lucideLogOut" />
            Cerrar sesión
          </button>
        </div>
      </hlm-popover-content>
    </hlm-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileOverlay {
  private router = inject(Router);
  private authDataSource = inject(AuthDataSource);

  readonly open = signal(false);
  readonly user = this.authDataSource.user;

  setting() {
    this.open.set(false);
    void this.router.navigate(['/home/settings']);
  }

  logout() {
    this.authDataSource.logout().subscribe(() => {
      this.open.set(false);
      void this.router.navigate(['/login']);
    });
  }
}
