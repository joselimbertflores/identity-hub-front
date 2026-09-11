import { TitleCasePipe } from '@angular/common';
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
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmPaginationImports } from '@spartan-ng/helm/pagination';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { SearchInput } from '../../../../shared';
import { PasswordActionDialog, PasswordActionOperation, UserEditor } from '../../dialogs';
import { UserResponse } from '../../interfaces';
import { UserDataSource } from '../../services';

@Component({
  selector: 'app-user-admin',
  imports: [
    TitleCasePipe,
    NgIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmPaginationImports,
    HlmTableImports,
    SearchInput,
  ],
  templateUrl: './user-admin.html',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export default class UserAdmin {
  private readonly dialogService = inject(HlmDialogService);
  private readonly userApi = inject(UserDataSource);

  readonly limit = signal(10);
  readonly offset = signal(0);
  readonly searchTerm = signal('');
  readonly roleResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.searchTerm(),
    }),
    stream: ({ params }) => this.userApi.findAll(params.limit, params.offset, params.term),
  });

  readonly dataSource = linkedSignal(() => {
    if (!this.roleResource.hasValue()) return [];
    return this.roleResource.value().users;
  });

  readonly dataSize = linkedSignal(() => {
    if (!this.roleResource.hasValue()) return 0;
    return this.roleResource.value().total;
  });

  readonly currentPage = computed(() => Math.floor(this.offset() / this.limit()) + 1);

  openUserDialog(user?: UserResponse): void {
    const dialogRef = this.dialogService.open<UserResponse>(UserEditor, {
      context: { user },
      contentClass: 'sm:!max-w-3xl',
      showCloseButton: false,
      disableClose: true,
    });
    dialogRef.closed$.subscribe((result) => {
      if (result) this.updateItemDataSource(result);
    });
  }

  openPasswordActionDialog(user: UserResponse, operation: PasswordActionOperation): void {
    const dialogRef = this.dialogService.open<UserResponse | null>(PasswordActionDialog, {
      context: { user, operation },
      contentClass: 'sm:!max-w-3xl',
      showCloseButton: false,
      disableClose: true,
    });
    dialogRef.closed$.subscribe((result) => {
      if (result) this.updateItemDataSource(result);
    });
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

  passwordActionLabel(user: UserResponse): string {
    if (!user.passwordAction) return 'Restablecer contraseña';
    return user.passwordAction.purpose === 'INITIAL_SETUP'
      ? 'Reenviar enlace de configuración'
      : 'Reenviar enlace de restablecimiento';
  }

  private updateItemDataSource(item: UserResponse): void {
    const index = this.dataSource().findIndex(({ id }) => item.id === id);
    if (index === -1) {
      this.dataSource.update((values) => [item, ...values]);
      this.dataSize.update((value) => value + 1);
      return;
    }

    this.dataSource.update((values) => {
      values[index] = item;
      return [...values];
    });
  }
}
