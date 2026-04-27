import { Component, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { TableModule, TablePageEvent } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

import { ApplicationEditor, ClientSecretDialog } from '../../dialogs';
import { ApplicationDataSource } from '../../services';
import { SearchInput } from '../../../../shared';

@Component({
  selector: 'app-application-admin',
  imports: [ButtonModule, TableModule, SearchInput, ConfirmDialogModule, MenuModule],
  templateUrl: './application-admin.html',
  providers: [ConfirmationService],
})
export default class ApplicationAdmin {
  private dialogService = inject(DialogService);
  private applicationApi = inject(ApplicationDataSource);
  private confirmationService = inject(ConfirmationService);

  limit = signal(10);
  offset = signal(0);
  searchTerm = signal('');
  roleResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.searchTerm(),
    }),
    stream: ({ params }) => this.applicationApi.findAll(params.limit, params.offset, params.term),
  });

  dataSource = linkedSignal(() => {
    if (!this.roleResource.hasValue()) return [];
    return this.roleResource.value().clients;
  });

  dataSize = linkedSignal(() => {
    if (!this.roleResource.hasValue()) return 0;
    return this.roleResource.value().total;
  });

  menuItems: MenuItem[] = [];

  openApplicationDialog(app?: any) {
    const dialogRef = this.dialogService.open(ApplicationEditor, {
      header: app ? 'Editar sistema' : 'Crear sistema',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '40vw',
      data: app,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result?: { application: any; clientSecret?: string }) => {
      if (!result) return;
      if (result.clientSecret) {
        this.showClientSecretDialog(result.application, result.clientSecret);
      }
      this.updateItemDataSource(result.application);
    });
  }

  confirmRegenerateSecret(application: any) {
    this.confirmationService.confirm({
      header: 'Regenerar secreto',
      message: `El secreto actual de "${application.name}" dejará de funcionar inmediatamente. ¿Deseas continuar?`,
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Regenerar',
        severity: 'primary',
      },
      accept: () => {
        this.regenerateSecret(application);
      },
    });
  }

  openMenu(row: any) {
    this.menuItems = [
      {
        label: 'Opciones',
        items: [
          {
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => this.openApplicationDialog(row),
          },
          {
            label: 'Regenerar secreto',
            icon: 'pi pi-key',
            command: () => this.confirmRegenerateSecret(row),
          },
        ],
      },
    ];
  }

  search(term: string) {
    this.offset.set(0);
    this.searchTerm.set(term);
  }

  changePage(event: TablePageEvent) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
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

  private regenerateSecret(application: any) {
    this.applicationApi.regenerateSecret(application.id).subscribe(({ clientSecret }) => {
      this.showClientSecretDialog(application, clientSecret);
    });
  }

  private showClientSecretDialog(application: any, clientSecret: string): void {
    this.dialogService.open(ClientSecretDialog, {
      header: 'Nuevo secreto generado',
      closeOnEscape: true,
      draggable: false,
      closable: true,
      modal: true,
      width: '40vw',
      data: { application, clientSecret },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
  }
}
