import { ChangeDetectionStrategy, Component, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { TableModule, TablePageEvent } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { MenuItem } from 'primeng/api';

import { UserEditor } from '../../dialogs';
import { SearchInput } from '../../../../shared';
import { UserDataSource } from '../../services';

@Component({
  selector: 'app-user-admin',
  imports: [CommonModule, ButtonModule, TableModule, SearchInput, MenuModule, TagModule],
  templateUrl: './user-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UserAdmin {
  private dialogService = inject(DialogService);
  private clientDataSource = inject(UserDataSource);

  limit = signal(10);
  offset = signal(0);
  searchTerm = signal('');
  roleResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.searchTerm(),
    }),
    stream: ({ params }) => this.clientDataSource.findAll(params.limit, params.offset, params.term),
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

  search(term: string) {
    this.offset.set(0);
    this.searchTerm.set(term);
  }

  changePage(event: TablePageEvent) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
  }

  openMenu(row: any, event: Event) {
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
            label: 'Eliminar',
            icon: 'pi pi-calendar',
            // command: () => this.remove(row.id, event),
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
