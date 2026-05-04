import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterModule } from '@angular/router';

import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';

import { ProfileOverlay, AppSidebar } from './components';
import { AuthDataSource } from '../../core';

@Component({
  selector: 'app-app-layout',
  imports: [
    RouterModule,
    DrawerModule,
    ButtonModule,
    AvatarModule,
    ProfileOverlay,
    ToastModule,
    AppSidebar,
  ],
  templateUrl: './app-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AppLayout {
  private authDataSource = inject(AuthDataSource);
  
  isMobile = signal(false);
  mobileMenuOpen = signal(false);
  user = this.authDataSource.user;

  constructor(private breakpoint: BreakpointObserver) {
    this.breakpoint.observe('(max-width: 1023px)').subscribe(({ matches }) => {
      if (!matches) {
        this.mobileMenuOpen.set(false);
      }
      this.isMobile.set(matches);
    });
  }

  openMobileMenu() {
    this.mobileMenuOpen.set(true);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
}
