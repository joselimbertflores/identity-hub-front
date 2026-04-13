import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppIcon } from '../../../../shared';
import { AuthDataSource } from '../../services';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, AppIcon],
  template: `
    <nav class="h-full flex flex-col">
      <div class="h-14 flex items-center gap-x-4 px-6 border-b border-surface-100">
        <app-icon class="w-8 h-8 text-primary-600" />
        <span class="text-xl font-bold tracking-tight text-surface-900"> SIAA </span>
      </div>

      <ul class="flex-1 sm:p-2 space-y-1 overflow-auto">
        @for (item of menu(); track $index) {
          <li>
            <a
              [routerLink]="item.routerLink"
              routerLinkActive="bg-primary-100 text-primary-700"
              [routerLinkActiveOptions]="{ exact: true }"
              class="
            flex items-center gap-3 px-3 py-2 rounded-lg
            text-surface-700
            hover:bg-surface-100
            transition-colors
          "
            >
              <i class="pi {{ item.icon }}"></i>
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
export class Sidebar {
  private authDataSource = inject(AuthDataSource);
  menu = this.authDataSource.menu;
}
