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
      [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_-]*$'),
        Validators.minLength(3),
        Validators.maxLength(100),
      ],
    ],
    description: [''],
    launchUrl: ['', Validators.required],
    isConfidential: [true],
    isActive: [true],
    redirectUris: [[], Validators.required],
    color: ['#2B7FFF'],
  });

  formUtils = FormUtils;

  ngOnInit() {
    this.loadForm();
  }

  save() {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    if (this.data) {
      this.clientDataSource.update(this.data.id, this.applicationForm.value).subscribe((app) => {
        this.dialogRef.close({ application: app });
      });
    } else {
      this.clientDataSource
        .create(this.applicationForm.value)
        .subscribe(({ clientSecret, application }) => {
          this.dialogRef.close({ application, clientSecret });
        });
    }
  }

  close() {
    this.dialogRef.close();
  }

  preventSubmit(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  private loadForm() {
    if (this.data) {
      this.applicationForm.controls['clientId'].disable();
      this.applicationForm.patchValue(this.data);
    }
  }
}
