import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RouterModule } from '@angular/router';

import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';

import { ProfileOverlay, Sidebar } from '../../components';

@Component({
  selector: 'app-home-layout',
  imports: [RouterModule, Sidebar, DrawerModule, ButtonModule, AvatarModule, ProfileOverlay, ToastModule],
  templateUrl: './home-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeLayout {
  isMobile = signal(false);
  mobileMenuOpen = signal(false);

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
