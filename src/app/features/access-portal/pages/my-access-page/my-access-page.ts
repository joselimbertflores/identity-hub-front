import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SkeletonModule } from 'primeng/skeleton';

import { finalize } from 'rxjs';

import { AccessDataSource } from '../../services';

@Component({
  selector: 'app-my-access-page',
  imports: [SkeletonModule],
  templateUrl: './my-access-page.html',
})
export default class MyAccessPage {
  private accesDataSource = inject(AccessDataSource);

  isLoading = signal(true);

  applications = toSignal(
    this.accesDataSource.getMyApplications().pipe(finalize(() => this.isLoading.set(false))),
    { initialValue: [] },
  );

  readonly skeletonItems = Array.from({ length: 6 });

  openApp(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
