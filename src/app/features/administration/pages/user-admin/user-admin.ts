import { Component, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { TableModule, TablePageEvent } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';

import { UserEditor } from '../../dialogs';
import { SearchInput } from '../../../../shared';
import { UserDataSource } from '../../services';

@Component({
  selector: 'app-user-admin',
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    SearchInput,
    MenuModule,
    TagModule,
    ConfirmDialogModule,
  ],
  templateUrl: './user-admin.html',
  providers: [ConfirmationService],
})
export default class UserAdmin {
  private dialogService = inject(DialogService);
  private userApi = inject(UserDataSource);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  limit = signal(10);
  offset = signal(0);
  searchTerm = signal('');
  roleResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.searchTerm(),
    }),
    stream: ({ params }) => this.userApi.findAll(params.limit, params.offset, params.term),
  });

  dataSource = linkedSignal(() => {
    if (!this.roleResource.hasValue()) return [];
    return this.roleResource.value().users;
  });

  dataSize = linkedSignal(() => {
    if (!this.roleResource.hasValue()) return 0;
    return this.roleResource.value().total;
  });

  menuOptions = signal<MenuItem[]>([]);
  menuItems: MenuItem[] = [];

  openUserDialog(user?: any) {
    const dialogRef = this.dialogService.open(UserEditor, {
      header: user ? 'Editar usuario' : 'Crear usuario',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '40vw',
      data: user,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result?: any) => {
      if (!result) return;
      this.updateItemDataSource(result);
    });
  }

  resetCrendentials(user: any, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      header: '¿Restablecer credenciales?',
      message: 'El usuario debera cambiar nuevamente sus credenciales',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
        severity: 'primary',
      },
      accept: () => {
        this.userApi.resetCredentials(user.id).subscribe(({ message }) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message,
          });
        });
      },
    });
  }

  search(term: string) {
    this.offset.set(0);
    this.searchTerm.set(term);
  }

  changePage(event: TablePageEvent) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
  }

  openMenu(row: any, event: Event) {
    console.log(row.id);
    this.menuItems = [
      {
        label: 'Opciones',
        items: [
          {
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => this.openUserDialog(row),
          },
          {
            label: 'Restablecer credenciales',
            icon: 'pi pi-sync',
            command: () => this.resetCrendentials(row, event),
          },
        ],
      },
    ];
  }

  private updateItemDataSource(item: any): void {
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
}
