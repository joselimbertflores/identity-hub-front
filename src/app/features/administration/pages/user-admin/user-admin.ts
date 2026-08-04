import { CommonModule } from '@angular/common';
import { Component, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { SearchInput } from '../../../../shared';
import { PasswordActionDialog, PasswordActionOperation, UserEditor } from '../../dialogs';
import { UserResponse } from '../../interfaces';
import { UserDataSource } from '../../services';

@Component({
  selector: 'app-user-admin',
  imports: [CommonModule, ButtonModule, TableModule, SearchInput, MenuModule, TagModule],
  templateUrl: './user-admin.html',
  providers: [DialogService],
})
export default class UserAdmin {
  private readonly dialogService = inject(DialogService);
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

  readonly menuOptions = signal<MenuItem[]>([]);
  menuItems: MenuItem[] = [];

  openUserDialog(user?: UserResponse): void {
    const dialogRef = this.dialogService.open(UserEditor, {
      header: user ? 'Editar usuario' : 'Crear usuario',
      modal: true,
      draggable: false,
      closeOnEscape: false,
      closable: false,
      width: '44rem',
      data: user,
      breakpoints: {
        '960px': '75vw',
        '640px': '94vw',
      },
    });
    dialogRef?.onClose.subscribe((result?: UserResponse) => {
      if (result) this.updateItemDataSource(result);
    });
  }

  openPasswordActionDialog(user: UserResponse, operation: PasswordActionOperation): void {
    const dialogRef = this.dialogService.open(PasswordActionDialog, {
      header:
        operation === 'reset'
          ? 'Restablecer contraseña'
          : user.passwordAction?.purpose === 'INITIAL_SETUP'
            ? 'Reenviar enlace de configuración'
            : 'Reenviar enlace de restablecimiento',
      modal: true,
      draggable: false,
      closeOnEscape: false,
      closable: false,
      width: '46rem',
      data: { user, operation },
      breakpoints: {
        '960px': '75vw',
        '640px': '94vw',
      },
    });
    dialogRef?.onClose.subscribe((result?: UserResponse) => {
      if (result) this.updateItemDataSource(result);
    });
  }

  search(term: string): void {
    this.offset.set(0);
    this.searchTerm.set(term);
  }

  changePage(event: TablePageEvent): void {
    this.limit.set(event.rows);
    this.offset.set(event.first);
  }

  openMenu(row: UserResponse): void {
    const passwordAction = this.getPasswordActionMenuItem(row);
    this.menuItems = [
      {
        label: 'Opciones',
        items: [
          {
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => this.openUserDialog(row),
          },
          ...(passwordAction ? [passwordAction] : []),
        ],
      },
    ];
  }

  private getPasswordActionMenuItem(user: UserResponse): MenuItem | null {
    if (!user.isActive) return null;

    if (!user.passwordAction) {
      return {
        label: 'Restablecer contraseña',
        icon: 'pi pi-sync',
        command: () => this.openPasswordActionDialog(user, 'reset'),
      };
    }

    return {
      label:
        user.passwordAction.purpose === 'INITIAL_SETUP'
          ? 'Reenviar enlace de configuración'
          : 'Reenviar enlace de restablecimiento',
      icon: 'pi pi-send',
      command: () => this.openPasswordActionDialog(user, 'resend'),
    };
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
