import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ListboxModule } from 'primeng/listbox';
import { StepperModule } from 'primeng/stepper';
import { ButtonModule } from 'primeng/button';

import { UserDataSource } from '../../services';
import { UserResponse } from '../../interfaces';

@Component({
  selector: 'app-user-editor',
  imports: [
    ReactiveFormsModule,
    MultiSelectModule,
    FloatLabelModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    StepperModule,
    ListboxModule,
  ],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="save()">
      <p-stepper [value]="1">
        <p-step-list>
          <p-step [value]="1">Datos Usuario</p-step>
          <p-step [value]="2">Accesos</p-step>
        </p-step-list>
        <p-step-panels>
          <p-step-panel [value]="1">
            <ng-template #content let-activateCallback="activateCallback">
              <div class="grid sm:grid-cols-1 lg:grid-cols-2 gap-x-2 gap-y-6">
                <div class="sm:col-span-2">
                  <p-floatlabel variant="on">
                    <input
                      id="fullName"
                      [fluid]="true"
                      pInputText
                      autocomplete="off"
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
                    <p-multiselect
                      id="selectRoles"
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
                    <label for="relationKey">Clave de relación</label>
                  </p-floatlabel>
                </div>
              </div>

              <div class="flex pt-4 px-2 justify-end">
                <p-button
                  label="Siguiente"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  size="small"
                  outlined
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
                scrollHeight="600px"
                filterPlaceHolder="Nombre del sistema"
                formControlName="applicationIds"
                emptyFilterMessage="Sin resultados"
                emptyMessage="Sin registros"
              >
                <ng-template #item let-option>
                  <div class="flex flex-col ml-2">
                    <p class="font-medium text-primary">{{ option.name }}</p>
                    <span class="text-sm">{{ option.description }}</span>
                  </div>
                </ng-template>
              </p-listbox>
              <div class="flex pt-4 px-2 justify-between">
                <p-button
                  label="Atras"
                  severity="secondary"
                  icon="pi pi-arrow-left"
                  size="small"
                  outlined
                  (onClick)="activateCallback(1)"
                />
              </div>
            </ng-template>
          </p-step-panel>
        </p-step-panels>
      </p-stepper>
      <div class="p-dialog-footer">
        <p-button label="Cancelar" type="button" severity="secondary" (onClick)="close()" />
        <p-button label="Guardar" type="submit" [disabled]="userForm.invalid" />
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditor {
  private _formBuilder = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private userDataSource = inject(UserDataSource);

  readonly data: UserResponse = inject(DynamicDialogConfig).data;
  userForm: FormGroup = this._formBuilder.nonNullable.group({
    fullName: ['', Validators.required],
    login: ['', Validators.required],
    roles: [[], Validators.required],
    relationKey: [],
    applicationIds: [[]],
  });

  selectApplicationsIds = signal<number[]>([]);

  readonly applications = this.userDataSource.applications;

  readonly ROLES = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Usuario', value: 'USER' },
  ];

  ngOnInit() {
    this.loadForm();
  }

  save() {
    if (this.userForm.invalid) return;

    // const saveObservable = this.data
    //   ? this.userDataSource.update(this.data.id, this.userForm.value)
    //   : this.userDataSource.create(this.userForm.value);
    // saveObservable.subscribe((resp) => {
    //   this.dialogRef.close(resp);
    // });
  }

  close() {
    this.dialogRef.close();
  }

  private loadForm(): void {
    console.log(this.data);
    if (!this.data) return;
    const { userApplications: accesses, ...props } = this.data;
    this.userForm.patchValue({
      ...props,
      applicationIds: accesses.map(({ applicationId }) => applicationId),
    });
  }
}
