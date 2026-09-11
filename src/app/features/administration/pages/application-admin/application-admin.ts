import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';

import {
  ApplicationEditor,
  ApplicationEditorResult,
  ClientSecretDialog,
} from '../../dialogs';
import { ApplicationDataSource } from '../../services';
import { SearchInput } from '../../../../shared';
import { ApplicationResponse } from '../../interfaces';

@Component({
  selector: 'app-application-admin',
  imports: [
    NgIcon,
    HlmAlertDialogImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmPaginationImports,
    HlmTableImports,
    SearchInput,
  ],
  templateUrl: './application-admin.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export default class ApplicationAdmin {
  private readonly dialogService = inject(HlmDialogService);
  private readonly applicationApi = inject(ApplicationDataSource);

  readonly limit = signal(10);
  readonly offset = signal(0);
  readonly searchTerm = signal('');
  readonly roleResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.searchTerm(),
    }),
    stream: ({ params }) => this.applicationApi.findAll(params.limit, params.offset, params.term),
  });

  readonly dataSource = linkedSignal(() => {
    if (!this.roleResource.hasValue()) return [];
    return this.roleResource.value().clients;
  });

  readonly dataSize = linkedSignal(() => {
    if (!this.roleResource.hasValue()) return 0;
    return this.roleResource.value().total;
  });

  readonly currentPage = computed(() => Math.floor(this.offset() / this.limit()) + 1);
  readonly pendingSecretRegeneration = signal<ApplicationResponse | null>(null);

  openApplicationDialog(app?: ApplicationResponse): void {
    const dialogRef = this.dialogService.open<ApplicationEditorResult>(ApplicationEditor, {
      context: { application: app },
      contentClass: 'sm:!max-w-2xl',
    });
    dialogRef.closed$.subscribe(
      (result) => {
        if (!result) return;
        if (result.clientSecret) {
          this.showClientSecretDialog(result.application, result.clientSecret);
        }
        this.updateItemDataSource(result.application);
      },
    );
  }

  confirmRegenerateSecret(application: ApplicationResponse): void {
    this.pendingSecretRegeneration.set(application);
  }

  search(term: string): void {
    this.offset.set(0);
    this.searchTerm.set(term);
  }

  changePage(page: number): void {
    this.offset.set((page - 1) * this.limit());
  }

  changePageSize(limit: number): void {
    this.limit.set(limit);
    this.offset.set(0);
  }

  private updateItemDataSource(item: ApplicationResponse): void {
    const index = this.dataSource().findIndex(({ id }) => item.id === id);
    if (index === -1) {
      this.dataSource.update((values) => [item, ...values]);
      this.dataSize.update((value) => (value += 1));
    } else {
      this.dataSource.update((values) => {
        values[index] = item;
        return [...values];
      });
    }
  }

  regenerateSecret(application: ApplicationResponse): void {
    this.applicationApi.regenerateSecret(application.id).subscribe(({ clientSecret }) => {
      this.showClientSecretDialog(application, clientSecret);
    });
  }

  private showClientSecretDialog(application: ApplicationResponse, clientSecret: string): void {
    this.dialogService.open(ClientSecretDialog, {
      context: { application, clientSecret },
      contentClass: 'sm:!max-w-xl',
    });
  }
}
