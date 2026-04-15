import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

import { ApplicationResponse } from '../../interfaces';
import { ApplicationDataSource } from '../../services';
import { FormUtils } from '../../../../helpers';

@Component({
  selector: 'app-application-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FloatLabelModule,
    InputTextModule,
    ButtonModule,
    AutoCompleteModule,
    ColorPickerModule,
    MessageModule,
  ],
  templateUrl: './application-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationEditor {
  private _formBuilder = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private clientDataSource = inject(ApplicationDataSource);

  readonly data?: ApplicationResponse = inject(DynamicDialogConfig).data;

  applicationForm: FormGroup = this._formBuilder.nonNullable.group({
    name: ['', Validators.required],
    clientId: [
      '',
      [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]*$'), Validators.minLength(3)],
    ],
    description: [''],
    launchUrl: ['', Validators.required],
    clientProfile: ['', Validators.required],
    isConfidential: [true, Validators.required],
    isActive: [true, Validators.required],
    redirectUris: [[], Validators.required],
    color: ['#2B7FFF'],
  });

  formUtils = FormUtils;

  ngOnInit() {
    this.loadForm();
  }

  save() {
    const saveObservable = this.data
      ? this.clientDataSource.update(this.data.id, this.applicationForm.value)
      : this.clientDataSource.create(this.applicationForm.value);
    saveObservable.subscribe((resp) => {
      this.dialogRef.close(resp);
    });
  }

  close() {
    this.dialogRef.close();
  }

  private loadForm() {
    this.applicationForm.patchValue(this.data ?? {});
  }
}
