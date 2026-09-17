import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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
import { catchError, distinctUntilChanged, EMPTY, finalize, Subject, switchMap, timer } from 'rxjs';

import { PasswordActionDeliveryView } from '../../components/password-action-delivery/password-action-delivery';
import {
  CreateUserRequest,
  EmployeeResponse,
  SaveUserRequest,
  UserResponse,
  UserRole,
} from '../../interfaces';
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
            <button hlmTabsTrigger="details" type="button">{{ data ? 'Datos del usuario' : 'Cuenta' }}</button>
            <button hlmTabsTrigger="access" type="button">Accesos</button>
          </hlm-tabs-list>

          <div hlmTabsContent="details" class="mt-4">
            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              @if (!data) {
                <div hlmField class="lg:col-span-2"
                  [forceInvalid]="userForm.controls.relationKey.touched && userForm.controls.relationKey.invalid">
                  <label hlmFieldLabel for="employee">Funcionario</label>
                  <hlm-combobox
                    [value]="selectedEmployee()"
                    (valueChange)="selectEmployee($event)"
                    [search]="employeeSearch()"
                    (searchChange)="searchEmployees($event)"
                    [itemToString]="employeeName"
                    [filter]="showRemoteEmployee"
                    [disabled]="isSaving()"
                  >
                    <hlm-combobox-input
                      inputId="employee"
                      placeholder="Buscar por nombre, CI o cargo"
                      showClear
                      triggerAriaLabel="Mostrar funcionarios"
                      clearAriaLabel="Limpiar funcionario"
                      [forceInvalid]="userForm.controls.relationKey.touched && userForm.controls.relationKey.invalid"
                      [aria-invalid]="userForm.controls.relationKey.touched && userForm.controls.relationKey.invalid"
                    />
                    <hlm-combobox-content *hlmComboboxPortal>
                      @if (isSearchingEmployees()) {
                        <hlm-combobox-status><hlm-spinner /> Buscando funcionarios…</hlm-combobox-status>
                      } @else if (employeeSearchError()) {
                        <hlm-combobox-status>{{ employeeSearchError() }}</hlm-combobox-status>
                      } @else if (employeeSearch().trim().length < 2) {
                        <hlm-combobox-status>Escriba al menos 2 caracteres para buscar.</hlm-combobox-status>
                      } @else {
                        <hlm-combobox-empty>No se encontraron funcionarios.</hlm-combobox-empty>
                      }
                      <div hlmComboboxList>
                        @for (employee of employees(); track employee.relationKey) {
                          <hlm-combobox-item [value]="employee">
                            <div class="flex min-w-0 flex-col gap-0.5">
                              <span class="font-medium">{{ employee.fullName }}</span>
                              @if (employee.position) {
                                <span class="text-xs text-muted-foreground">{{ employee.position }}</span>
                              }
                              @if (employee.unit) {
                                <span class="text-xs text-muted-foreground">{{ employee.unit }}</span>
                              }
                              @if (employee.area && employee.area !== employee.unit) {
                                <span class="text-xs text-muted-foreground">{{ employee.area }}</span>
                              }
                            </div>
                          </hlm-combobox-item>
                        }
                      </div>
                    </hlm-combobox-content>
                  </hlm-combobox>
                  <p hlmFieldDescription>Busque y seleccione un funcionario de Recursos Humanos.</p>
                  @if (selectedEmployee(); as employee) {
                    <div class="flex flex-col gap-1 rounded-md border border-border bg-muted/30 p-3" aria-live="polite">
                      <span class="text-xs text-muted-foreground">Funcionario seleccionado</span>
                      <span class="font-medium">{{ employee.fullName }}</span>
                      @if (employee.position) { <span class="text-sm">{{ employee.position }}</span> }
                      @if (employee.unit) { <span class="text-sm text-muted-foreground">{{ employee.unit }}</span> }
                      @if (employee.area && employee.area !== employee.unit) {
                        <span class="text-xs text-muted-foreground">{{ employee.area }}</span>
                      }
                    </div>
                  }
                  @if (userForm.controls.relationKey.touched && userForm.controls.relationKey.invalid) {
                    <hlm-field-error forceShow>Seleccione un funcionario de Recursos Humanos.</hlm-field-error>
                  }
                </div>
              } @else {
                <div hlmField class="lg:col-span-2">
                  <label hlmFieldLabel for="fullName">Nombre completo</label>
                  <input id="fullName" hlmInput autocomplete="name" formControlName="fullName" />
                  @if (userForm.controls.fullName.touched && userForm.controls.fullName.invalid) {
                    <hlm-field-error>El nombre completo es obligatorio.</hlm-field-error>
                  }
                </div>
              }

              <div hlmField>
                <label hlmFieldLabel for="login">Usuario</label>
                <input id="login" hlmInput autocomplete="off" formControlName="login" />
                @if (userForm.controls.login.touched && userForm.controls.login.invalid) {
                  <hlm-field-error>El usuario es obligatorio.</hlm-field-error>
                }
              </div>

              <div hlmField>
                <label hlmFieldLabel for="email">{{ data ? 'Correo (opcional)' : 'Correo' }}</label>
                <input id="email" hlmInput type="email" autocomplete="email" formControlName="email" />
                @if (userForm.controls.email.touched && userForm.controls.email.invalid) {
                  <hlm-field-error>{{ userForm.controls.email.hasError('required') ? 'El correo es obligatorio.' : 'Ingrese un correo válido.' }}</hlm-field-error>
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

              @if (data) {
                <div hlmField>
                  <label hlmFieldLabel for="relationKey">Clave de relación (opcional)</label>
                  <input id="relationKey" hlmInput autocomplete="off" formControlName="relationKey" />
                </div>
              }

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
  private readonly dialogRef = inject<BrnDialogRef<boolean>>(BrnDialogRef);
  private readonly userDataSource = inject(UserDataSource);

  readonly data = injectBrnDialogContext<UserEditorContext>().user;
  readonly activeTab = signal('details');
  readonly createdResult = signal<CreateUserResponse | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly selectedEmployee = signal<EmployeeResponse | null>(null);
  readonly employeeSearch = signal('');
  readonly employees = signal<EmployeeResponse[]>([]);
  readonly isSearchingEmployees = signal(false);
  readonly employeeSearchError = signal<string | null>(null);
  private readonly employeeSearchChanges = new Subject<string>();

  readonly employeeName = (employee: EmployeeResponse): string => employee.fullName;
  // RRHH already filters by name, CI and position; do not filter its results again by name.
  readonly showRemoteEmployee = (): boolean => true;

  readonly userForm = this.formBuilder.nonNullable.group({
    fullName: [{ value: '', disabled: !this.data }, Validators.required],
    login: ['', Validators.required],
    email: ['', this.data ? [Validators.email] : [Validators.required, Validators.email]],
    roles: this.formBuilder.nonNullable.control<UserRole[]>([], Validators.required),
    isActive: [true],
    relationKey: ['', this.data ? [] : [Validators.required]],
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

  constructor() {
    if (this.data) return;

    this.employeeSearchChanges
      .pipe(
        distinctUntilChanged(),
        switchMap((q) => {
          this.employees.set([]);
          this.employeeSearchError.set(null);
          this.isSearchingEmployees.set(q.length >= 2);
          if (q.length < 2) return EMPTY;

          // Cancel both the debounce and any in-flight request as soon as the search changes.
          return timer(300).pipe(
            switchMap(() => this.userDataSource.searchEmployees(q)),
            catchError((error: HttpErrorResponse) => {
              this.employeeSearchError.set(this.getErrorMessage(error, true));
              return EMPTY;
            }),
            finalize(() => this.isSearchingEmployees.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe(({ data }) => this.employees.set(data));
  }

  searchEmployees(search: string): void {
    this.employeeSearch.set(search);
    if (search && this.selectedEmployee()) {
      this.selectedEmployee.set(null);
      this.userForm.controls.relationKey.setValue('');
      this.userForm.controls.relationKey.markAsTouched();
    }
    this.employeeSearchChanges.next(search.trim());
  }

  selectEmployee(employee: EmployeeResponse | null | undefined): void {
    this.selectedEmployee.set(employee ?? null);
    this.userForm.controls.relationKey.setValue(employee?.relationKey ?? '');
    this.userForm.controls.relationKey.markAsTouched();
    this.userForm.controls.relationKey.markAsDirty();
    this.employeeSearch.set('');
    this.employeeSearchChanges.next('');
  }

  ngOnInit(): void {
    this.loadForm();
  }

  save(): void {
    if (this.userForm.invalid || this.isSaving() || (!this.data && !this.selectedEmployee())) {
      this.userForm.markAllAsTouched();
      return;
    }

    const value = this.userForm.getRawValue();
    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (this.data) {
      const request: SaveUserRequest = {
        ...value,
        email: value.email.trim() || null,
        relationKey: value.relationKey.trim() || null,
      };
      this.userDataSource
        .update(this.data.id, request)
        .pipe(finalize(() => this.isSaving.set(false)))
        .subscribe({
          next: () => this.dialogRef.close(true),
          error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error)),
        });
      return;
    }

    const request: CreateUserRequest = {
      login: value.login,
      relationKey: this.selectedEmployee()!.relationKey,
      email: value.email.trim(),
      applicationIds: value.applicationIds.map(String),
      roles: value.roles,
      isActive: value.isActive,
    };
    this.userDataSource
      .create(request)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (response) => this.createdResult.set(response),
        error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error)),
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  closeCreatedResult(): void {
    this.dialogRef.close(true);
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

  private getErrorMessage(error: HttpErrorResponse, searchingEmployees = false): string {
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Revise su conexión e intente nuevamente.';
    }
    switch (this.getErrorCode(error)) {
      case 'RRHH_EMPLOYEE_NOT_FOUND':
        return 'El funcionario ya no se encuentra activo o disponible en Recursos Humanos.';
      case 'RRHH_EMPLOYEE_AMBIGUOUS':
        return 'No fue posible identificar de forma única al funcionario en Recursos Humanos.';
      case 'RRHH_UNAVAILABLE':
        return 'Recursos Humanos no se encuentra disponible temporalmente. Intente nuevamente.';
      case 'USER_RELATION_KEY_ALREADY_EXISTS':
        return 'El funcionario seleccionado ya tiene una cuenta en SIAU.';
      case 'USER_EMAIL_REQUIRED':
        return this.data
          ? 'Debes registrar un correo antes de enviar instrucciones de acceso.'
          : 'El correo es obligatorio para enviar las instrucciones de acceso.';
    }
    if (searchingEmployees) {
      if (error.status === 400) return 'Revise el texto de búsqueda e intente nuevamente.';
      if (error.status === 403) return 'No tiene permiso para buscar funcionarios.';
      return 'No se pudo buscar funcionarios. Intente nuevamente.';
    }
    if (error.status === 409) {
      return 'El nombre de usuario o correo ya está registrado.';
    }
    if (error.status === 400) {
      return 'Revise los datos del usuario e intente nuevamente.';
    }
    return 'No se pudo guardar el usuario. Intente nuevamente.';
  }

  private getErrorCode(error: HttpErrorResponse): string | null {
    if (!error.error || typeof error.error !== 'object') return null;
    const body = error.error as { code?: unknown };
    return typeof body.code === 'string' ? body.code : null;
  }
}
