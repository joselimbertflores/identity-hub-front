import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { BrnDialogRef, injectBrnDialogContext } from '@spartan-ng/brain/dialog';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import {
  HlmDialogFooter,
  HlmDialogHeader,
  HlmDialogTitle,
} from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';

import { ApplicationResponse } from '../../interfaces';
import { ApplicationDataSource } from '../../services';
import { FormUtils } from '../../../../helpers';

export interface ApplicationEditorContext {
  application?: ApplicationResponse;
}

export interface ApplicationEditorResult {
  application: ApplicationResponse;
  clientSecret?: string;
}

@Component({
  selector: 'app-application-editor',
  imports: [
    ReactiveFormsModule,
    NgIcon,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCheckboxImports,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmDialogTitle,
    HlmFieldImports,
    HlmInputImports,
  ],
  templateUrl: './application-editor.html',
  host: { class: 'flex flex-col gap-4' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationEditor {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject<BrnDialogRef<ApplicationEditorResult>>(BrnDialogRef);
  private readonly clientDataSource = inject(ApplicationDataSource);

  readonly data = injectBrnDialogContext<ApplicationEditorContext>().application;
  readonly redirectUriDraft = signal('');

  applicationForm: FormGroup = this.formBuilder.nonNullable.group({
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
    backchannelLogoutUri: ['', Validators.pattern(/^https?:\/\/\S+$/i)],
    isConfidential: [true],
    isActive: [true],
    redirectUris: [[], Validators.required],
    color: ['#2B7FFF'],
  });

  readonly formUtils = FormUtils;

  ngOnInit(): void {
    this.loadForm();
  }

  save(): void {
    this.commitRedirectUris();
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    const backchannelLogoutUri = String(
      this.applicationForm.controls['backchannelLogoutUri'].value ?? '',
    ).trim();
    const form = {
      ...this.applicationForm.value,
      backchannelLogoutUri: backchannelLogoutUri || null,
    };

    if (this.data) {
      this.clientDataSource.update(this.data.id, form).subscribe((app) => {
        this.dialogRef.close({ application: app });
      });
    } else {
      this.clientDataSource
        .create(form)
        .subscribe(({ clientSecret, application }) => {
          this.dialogRef.close({ application, clientSecret });
        });
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  updateRedirectUriDraft(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) this.redirectUriDraft.set(input.value);
  }

  commitRedirectUris(event?: Event): void {
    if (event instanceof KeyboardEvent && event.key === 'Enter') event.preventDefault();

    const additions = this.redirectUriDraft()
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    if (additions.length === 0) return;

    const control = this.applicationForm.controls['redirectUris'];
    const current = (control.value as string[]) ?? [];
    control.setValue([...new Set([...current, ...additions])]);
    control.markAsDirty();
    this.redirectUriDraft.set('');
  }

  removeRedirectUri(uri: string): void {
    const control = this.applicationForm.controls['redirectUris'];
    const current = (control.value as string[]) ?? [];
    control.setValue(current.filter((value) => value !== uri));
    control.markAsDirty();
  }

  private loadForm(): void {
    if (this.data) {
      this.applicationForm.controls['clientId'].disable();
      this.applicationForm.patchValue(this.data);
    }
  }
}
