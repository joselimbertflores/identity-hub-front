import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

import { AuthUserResponse } from '../../../../core/auth/auth.types';
import { MENU_ACTIONS } from '../../../../features/administration/constants/menu.config';
import { AppIcon } from '../../../../shared';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, NgIcon, AppIcon],
  template: `
    <nav class="h-full flex flex-col">
      <div class="flex h-14 items-center gap-4 border-b border-sidebar-border px-6">
        <app-icon class="size-8 text-primary" />
        <span class="text-xl font-bold tracking-tight text-sidebar-foreground"> SIAA </span>
      </div>

      <ul class="flex flex-1 flex-col gap-1 overflow-auto p-2">
        @for (item of menu(); track $index) {
          <li>
            <a
              [routerLink]="item.routerLink"
              routerLinkActive="bg-sidebar-accent text-sidebar-accent-foreground"
              [routerLinkActiveOptions]="{ exact: true }"
              class="
            flex items-center gap-3 rounded-lg px-3 py-2
            text-sidebar-foreground
            hover:bg-sidebar-accent hover:text-sidebar-accent-foreground
            transition-colors
          "
            >
              <ng-icon [name]="item.icon" />
              <span class="text-sm font-medium">
                {{ item.label }}
              </span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidebar {
  user = input.required<AuthUserResponse | null>();
  menu = computed(() =>
    MENU_ACTIONS.filter((item) => {
      const roles = item.roles;

      if (!roles || roles.length === 0) {
        return true;
      }

      return roles.some((role) => this.user()?.roles.includes(role));
    }),
  );
}
