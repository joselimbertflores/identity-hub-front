import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { finalize } from 'rxjs';

import { AccessDataSource } from '../../services';

@Component({
  selector: 'app-my-access-page',
  imports: [NgIcon, HlmEmptyImports, HlmSkeletonImports],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './my-access-page.html',
})
export default class MyAccessPage {
  private readonly accesDataSource = inject(AccessDataSource);

  readonly isLoading = signal(true);

  readonly applications = toSignal(
    this.accesDataSource.getMyApplications().pipe(finalize(() => this.isLoading.set(false))),
    { initialValue: [] },
  );

  readonly skeletonItems = Array.from({ length: 6 });

  openApp(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
