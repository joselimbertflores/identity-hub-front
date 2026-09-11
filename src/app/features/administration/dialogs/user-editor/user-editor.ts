import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon } from '@ng-icons/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmComboboxImports } from '@spartan-ng/helm/combobox';
import { HlmDialogFooter, HlmDialogHeader, HlmDialogTitle } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { finalize } from 'rxjs';

import { PasswordActionDeliveryView } from '../../components/password-action-delivery/password-action-delivery';
import { SaveUserRequest, UserResponse, UserRole } from '../../interfaces';
import { ApplicationDataSource, CreateUserResponse, UserDataSource } from '../../services';

export interface UserEditorContext {
  user?: UserResponse;
}

@Component({
  selector: 'app-user-editor',
  imports: [
    ReactiveFormsModule,
    NgIcon,
    HlmAlertImports,
    HlmButtonImports,
    HlmCheckboxImports,
    HlmComboboxImports,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInputImports,
    HlmSpinnerImports,
    HlmTabsImports,
    PasswordActionDeliveryView,
  ],
  host: { class: 'flex flex-col gap-4' },
  template: `
    <hlm-dialog-header>
      <h2 hlmDialogTitle>{{ data ? 'Editar usuario' : 'Crear usuario' }}</h2>
    </hlm-dialog-header>

    @if (createdResult(); as result) {
      <app-password-action-delivery [delivery]="result.passwordAction" context="create" />
      <hlm-dialog-footer class="mt-2 border-t border-border pt-4">
        <button hlmBtn type="button" (click)="closeCreatedResult()">Cerrar</button>
      </hlm-dialog-footer>
    } @else {
      <form class="flex flex-col gap-4" [formGroup]="userForm" (ngSubmit)="save()" novalidate>
        <hlm-tabs [tab]="activeTab()" (tabActivated)="activeTab.set($event)">
          <hlm-tabs-list class="grid w-full grid-cols-2">
            <button hlmTabsTrigger="details" type="button">Datos del usuario</button>
            <button hlmTabsTrigger="access" type="button">Accesos</button>
          </hlm-tabs-list>

          <div hlmTabsContent="details" class="mt-4">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div hlmField class="lg:col-span-2">
                <label hlmFieldLabel for="fullName">Nombre completo</label>
                <input id="fullName" hlmInput autocomplete="name" formControlName="fullName" />
                @if (userForm.controls.fullName.touched && userForm.controls.fullName.invalid) {
                  <hlm-field-error>El nombre completo es obligatorio.</hlm-field-error>
                }
              </div>

              <div hlmField>
                <label hlmFieldLabel for="login">Usuario</label>
                <input id="login" hlmInput autocomplete="off" formControlName="login" />
                @if (userForm.controls.login.touched && userForm.controls.login.invalid) {
                  <hlm-field-error>El usuario es obligatorio.</hlm-field-error>
                }
              </div>

              <div hlmField>
                <label hlmFieldLabel for="email">Correo (opcional)</label>
                <input id="email" hlmInput type="email" autocomplete="email" formControlName="email" />
                @if (userForm.controls.email.touched && userForm.controls.email.invalid) {
                  <hlm-field-error>Ingrese un correo válido.</hlm-field-error>
                }
              </div>

              <div hlmField>
                <label hlmFieldLabel for="selectRoles">Roles</label>
                <hlm-combobox-multiple formControlName="roles" [itemToString]="roleLabel">
                  <hlm-combobox-chips id="selectRoles">
                    <ng-template hlmComboboxValues let-values>
                      @for (role of values; track role) {
                        <hlm-combobox-chip [value]="role">{{ roleLabel(role) }}</hlm-combobox-chip>
                      }
                    </ng-template>
                    <input hlmComboboxChipInput placeholder="Seleccione roles" />
                  </hlm-combobox-chips>
                  <hlm-combobox-content *hlmComboboxPortal>
                    <hlm-combobox-empty>Sin resultados</hlm-combobox-empty>
                    <div hlmComboboxList>
                      @for (role of roles; track role.value) {
                        <hlm-combobox-item [value]="role.value">{{ role.label }}</hlm-combobox-item>
                      }
                    </div>
                  </hlm-combobox-content>
                </hlm-combobox-multiple>
                @if (userForm.controls.roles.touched && userForm.controls.roles.invalid) {
                  <hlm-field-error>Seleccione al menos un rol.</hlm-field-error>
                }
              </div>

              <div hlmField>
                <label hlmFieldLabel for="relationKey">Clave de relación (opcional)</label>
                <input id="relationKey" hlmInput autocomplete="off" formControlName="relationKey" />
              </div>

              <div hlmField orientation="horizontal" class="lg:col-span-2">
                <hlm-checkbox inputId="userStatus" formControlName="isActive" />
                <label hlmFieldLabel for="userStatus">Habilitado</label>
              </div>
            </div>

            <div class="mt-4 flex justify-end">
              <button hlmBtn variant="outline" size="sm" type="button" (click)="activeTab.set('access')">
                Siguiente
                <ng-icon name="lucideArrowRight" />
              </button>
            </div>
          </div>

          <div hlmTabsContent="access" class="mt-4">
            <div hlmField>
              <label hlmFieldLabel for="applications">Sistemas asignados</label>
              <hlm-combobox-multiple formControlName="applicationIds" [itemToString]="applicationName">
                <hlm-combobox-chips id="applications" class="max-h-28 overflow-auto">
                  <ng-template hlmComboboxValues let-values>
                    @for (applicationId of values; track applicationId) {
                      <hlm-combobox-chip [value]="applicationId">{{ applicationName(applicationId) }}</hlm-combobox-chip>
                    }
                  </ng-template>
                  <input hlmComboboxChipInput placeholder="Buscar sistema" />
                </hlm-combobox-chips>
                <hlm-combobox-content *hlmComboboxPortal>
                  <hlm-combobox-empty>Sin resultados</hlm-combobox-empty>
                  <div hlmComboboxList>
                    @for (application of applications(); track application.id) {
                      <hlm-combobox-item [value]="application.id">
                        <div class="flex flex-col">
                          <span class="font-medium">{{ application.name }}</span>
                          <span class="text-xs text-muted-foreground">{{ application.description }}</span>
                        </div>
                      </hlm-combobox-item>
                    }
                  </div>
                </hlm-combobox-content>
              </hlm-combobox-multiple>
              <p hlmFieldDescription>Seleccione los sistemas disponibles para este usuario.</p>
            </div>

            <div class="mt-4">
              <button hlmBtn variant="outline" size="sm" type="button" (click)="activeTab.set('details')">
                <ng-icon name="lucideArrowLeft" />
                Atrás
              </button>
            </div>
          </div>
        </hlm-tabs>

        @if (errorMessage()) {
          <div hlmAlert variant="destructive" aria-live="polite">
            <ng-icon name="lucideTriangleAlert" />
            <div><h3 hlmAlertTitle>Error</h3><p hlmAlertDescription>{{ errorMessage() }}</p></div>
          </div>
        }

        <hlm-dialog-footer class="border-t border-border pt-4">
          <button hlmBtn variant="secondary" type="button" [disabled]="isSaving()" (click)="close()">Cancelar</button>
          <button hlmBtn type="submit" [disabled]="userForm.invalid || isSaving()">
            @if (isSaving()) { <hlm-spinner /> }
            Guardar
          </button>
        </hlm-dialog-footer>
      </form>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditor {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject<BrnDialogRef<UserResponse>>(BrnDialogRef);
  private readonly userDataSource = inject(UserDataSource);

  readonly data = injectBrnDialogContext<UserEditorContext>().user;
  readonly activeTab = signal('details');
  readonly createdResult = signal<CreateUserResponse | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly userForm = this.formBuilder.nonNullable.group({
    fullName: ['', Validators.required],
    login: ['', Validators.required],
    email: ['', Validators.email],
    roles: this.formBuilder.nonNullable.control<UserRole[]>([], Validators.required),
    isActive: [true],
    relationKey: [''],
    applicationIds: this.formBuilder.nonNullable.control<number[]>([]),
  });

  readonly applications = toSignal(inject(ApplicationDataSource).getFormOptions(), {
    initialValue: [],
  });

  readonly roles: { label: string; value: UserRole }[] = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Usuario', value: 'USER' },
  ];

  readonly roleLabel = (role: UserRole): string =>
    this.roles.find((option) => option.value === role)?.label ?? role;

  readonly applicationName = (applicationId: number): string =>
    this.applications().find(({ id }) => id === applicationId)?.name ?? String(applicationId);

  ngOnInit(): void {
    this.loadForm();
  }

  save(): void {
    if (this.userForm.invalid || this.isSaving()) {
      this.userForm.markAllAsTouched();
      return;
    }

    const value = this.userForm.getRawValue();
    const request: SaveUserRequest = {
      ...value,
      email: value.email.trim() || null,
      relationKey: value.relationKey.trim() || null,
    };

    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (this.data) {
      this.userDataSource
        .update(this.data.id, request)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: ({ user }) =>
            this.dialogRef.close({
              ...user,
              passwordAction: this.data!.passwordAction,
            }),
          error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error)),
        });
      return;
    }

    this.userDataSource
      .create(request)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (response) =>
          this.createdResult.set({
            ...response,
            user: {
              ...response.user,
              passwordAction: {
                purpose: 'INITIAL_SETUP',
                expiresAt: response.passwordAction.expiresAt,
              },
            },
          }),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  closeCreatedResult(): void {
    this.dialogRef.close(this.createdResult()?.user);
  }

  private loadForm(): void {
    if (!this.data) return;
    const { applications, ...props } = this.data;
    this.userForm.patchValue({
      ...props,
      relationKey: props.relationKey ?? '',
      email: props.email ?? '',
      applicationIds: applications.map(({ id }) => id),
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Revise su conexión e intente nuevamente.';
    }
    if (error.status === 409) {
      return 'El nombre de usuario o correo ya está registrado.';
    }
    if (error.status === 400) {
      return 'Revise los datos del usuario e intente nuevamente.';
    }
    return 'No se pudo guardar el usuario. Intente nuevamente.';
  }
}
