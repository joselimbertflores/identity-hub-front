import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterModule } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';

import { ProfileOverlay, AppSidebar } from './components';
import { AuthDataSource } from '../../core';

@Component({
  selector: 'app-app-layout',
  imports: [RouterModule, NgIcon, HlmButtonImports, HlmSheetImports, ProfileOverlay, AppSidebar],
  templateUrl: './app-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppLayout {
  private readonly authDataSource = inject(AuthDataSource);

  readonly isMobile = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly user = this.authDataSource.user;

  constructor(private breakpoint: BreakpointObserver) {
    this.breakpoint.observe('(max-width: 1023px)').subscribe(({ matches }) => {
      if (!matches) {
        this.mobileMenuOpen.set(false);
      }
      this.isMobile.set(matches);
    });
  }

  openMobileMenu(): void {
    this.mobileMenuOpen.set(true);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
