import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { MessageModule } from 'primeng/message';
import { MultiSelectModule } from 'primeng/multiselect';
import { StepperModule } from 'primeng/stepper';

import { PasswordActionDeliveryView } from '../../components/password-action-delivery/password-action-delivery';
import { SaveUserRequest, UserResponse, UserRole } from '../../interfaces';
import { ApplicationDataSource, CreateUserResponse, UserDataSource } from '../../services';

@Component({
  selector: 'app-user-editor',
  imports: [
    ReactiveFormsModule,
    MultiSelectModule,
    FloatLabelModule,
    InputTextModule,
    CheckboxModule,
    StepperModule,
    ListboxModule,
    ButtonModule,
    MessageModule,
    PasswordActionDeliveryView,
  ],
  template: `
    @if (createdResult(); as result) {
      <app-password-action-delivery [delivery]="result.passwordAction" context="create" />
      <div class="mt-6 flex justify-end border-t border-surface-200 pt-4">
        <p-button label="Cerrar" type="button" (onClick)="closeCreatedResult()" />
      </div>
    } @else {
      <form [formGroup]="userForm" (ngSubmit)="save()" novalidate>
        <p-stepper [value]="1">
          <p-step-list>
            <p-step [value]="1">Datos del usuario</p-step>
            <p-step [value]="2">Accesos</p-step>
          </p-step-list>
          <p-step-panels>
            <p-step-panel [value]="1">
              <ng-template #content let-activateCallback="activateCallback">
                <div class="grid grid-cols-1 gap-x-3 gap-y-6 lg:grid-cols-2">
                  <div class="lg:col-span-2">
                    <p-floatlabel variant="on">
                      <input
                        id="fullName"
                        [fluid]="true"
                        pInputText
                        autocomplete="name"
                        formControlName="fullName"
                      />
                      <label for="fullName">Nombre completo</label>
                    </p-floatlabel>
                  </div>
                  <div>
                    <p-floatlabel variant="on">
                      <input
                        id="login"
                        [fluid]="true"
                        pInputText
                        autocomplete="off"
                        formControlName="login"
                      />
                      <label for="login">Usuario</label>
                    </p-floatlabel>
                  </div>
                  <div>
                    <p-floatlabel variant="on">
                      <input
                        id="email"
                        type="email"
                        [fluid]="true"
                        pInputText
                        autocomplete="email"
                        formControlName="email"
                      />
                      <label for="email">Correo (opcional)</label>
                    </p-floatlabel>
                    @if (userForm.controls.email.touched && userForm.controls.email.invalid) {
                      <small class="mt-1 block text-red-600">Ingrese un correo válido.</small>
                    }
                  </div>
                  <div>
                    <p-floatlabel variant="on">
                      <p-multiselect
                        inputId="selectRoles"
                        [options]="ROLES"
                        [filter]="false"
                        optionLabel="label"
                        optionValue="value"
                        [maxSelectedLabels]="3"
                        class="w-full"
                        formControlName="roles"
                      />
                      <label for="selectRoles">Roles</label>
                    </p-floatlabel>
                  </div>
                  <div>
                    <p-floatlabel variant="on">
                      <input
                        id="relationKey"
                        [fluid]="true"
                        pInputText
                        autocomplete="off"
                        formControlName="relationKey"
                      />
                      <label for="relationKey">Clave de relación (opcional)</label>
                    </p-floatlabel>
                  </div>
                  <div class="flex items-center px-1 lg:col-span-2">
                    <p-checkbox inputId="userStatus" [binary]="true" formControlName="isActive" />
                    <label for="userStatus" class="ml-2">Habilitado</label>
                  </div>
                </div>

                <div class="flex justify-end px-2 pt-5">
                  <p-button
                    label="Siguiente"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    size="small"
                    [outlined]="true"
                    type="button"
                    (onClick)="activateCallback(2)"
                  />
                </div>
              </ng-template>
            </p-step-panel>

            <p-step-panel [value]="2">
              <ng-template #content let-activateCallback="activateCallback">
                <p-listbox
                  [options]="applications()"
                  [multiple]="true"
                  [checkbox]="true"
                  [filter]="true"
                  class="w-full"
                  optionValue="id"
                  optionLabel="name"
                  scrollHeight="420px"
                  filterPlaceHolder="Nombre del sistema"
                  formControlName="applicationIds"
                  emptyFilterMessage="Sin resultados"
                  emptyMessage="Sin registros"
                >
                  <ng-template #item let-option>
                    <div class="ml-2 flex flex-col">
                      <p class="font-medium text-primary">{{ option.name }}</p>
                      <span class="text-sm">{{ option.description }}</span>
                    </div>
                  </ng-template>
                </p-listbox>
                <div class="flex justify-between px-2 pt-4">
                  <p-button
                    label="Atrás"
                    severity="secondary"
                    icon="pi pi-arrow-left"
                    size="small"
                    [outlined]="true"
                    type="button"
                    (onClick)="activateCallback(1)"
                  />
                </div>
              </ng-template>
            </p-step-panel>
          </p-step-panels>
        </p-stepper>

        @if (errorMessage()) {
          <p-message severity="error" class="mt-4 w-full" role="alert" aria-live="polite">
            {{ errorMessage() }}
          </p-message>
        }

        <div class="p-dialog-footer">
          <p-button
            label="Cancelar"
            type="button"
            severity="secondary"
            [disabled]="isSaving()"
            (onClick)="close()"
          />
          <p-button
            label="Guardar"
            type="submit"
            [loading]="isSaving()"
            [disabled]="userForm.invalid || isSaving()"
          />
        </div>
      </form>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditor {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly userDataSource = inject(UserDataSource);

  readonly data: UserResponse | undefined = inject(DynamicDialogConfig<UserResponse | undefined>)
    .data;
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

  readonly ROLES: { label: string; value: UserRole }[] = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Usuario', value: 'USER' },
  ];

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
          next: ({ user }) => this.dialogRef.close(user),
          error: (error: HttpErrorResponse) => this.errorMessage.set(this.getErrorMessage(error)),
        });
      return;
    }

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
