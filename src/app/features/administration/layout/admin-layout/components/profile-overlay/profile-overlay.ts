import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { AuthDataSource } from '../../../../../../core';



@Component({
  selector: 'profile-overlay',
  imports: [AvatarModule, PopoverModule, CommonModule, ButtonModule, Menu, RippleModule],
  template: `
    <p-avatar pRipple icon="pi pi-user" shape="circle" (click)="op.toggle($event)" />
    <p-popover #op [focusOnShow]="false">
      <ng-template pTemplate="content">
        <div class="w-[300px]">
          <div class="flex flex-col space-y-3 items-center">
            <div class="w-full flex justify-end">
              <p-button
                icon="pi pi-times"
                severity="secondary"
                [rounded]="true"
                [text]="true"
                (click)="op.hide()"
                size="small"
              />
            </div>
            <div>
              <p-avatar icon="pi pi-user" size="xlarge" shape="circle" />
            </div>
            <span class="font-semibold text-lg text-surface-800">
              {{ user()?.fullName | titlecase }}
            </span>
            <p-menu [model]="menuOptions" class="w-full">
              <ng-template #item let-item>
                <a
                  pRipple
                  class="flex items-center px-3 py-2 cursor-pointer"
                  [class]="item.linkClass"
                >
                  <span [class]="item.icon"></span>
                  <span class="ml-3">{{ item.label }}</span>
                </a>
              </ng-template>
            </p-menu>
          </div>
        </div>
      </ng-template>
    </p-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileOverlay {
  private router = inject(Router);
  private authDataSource = inject(AuthDataSource);

  readonly poppoverRef = viewChild.required<Popover>('op');

  user = this.authDataSource.user;

  readonly menuOptions: MenuItem[] = [
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => this.setting(),
    },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      linkClass: 'text-red-500',
      command: () => this.logout(),
    },
  ];

  setting() {
    this.poppoverRef().hide();
    this.router.navigate(['/home/settings']);
  }

  logout() {
    this.authDataSource.logout().subscribe(() => {
      this.poppoverRef().hide();
      this.router.navigate(['/login']);
    });
  }
}
