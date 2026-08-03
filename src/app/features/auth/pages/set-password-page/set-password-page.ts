import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

import { AuthDataSource } from '../../../../core';
import { FormUtils } from '../../../../helpers';
import { AppIcon } from '../../../../shared';
import { getAuthErrorMessage } from '../../utils/auth-error';
import {
  passwordMatchValidator,
  passwordStrengthValidator,
} from '../../utils/validators/password.validator';

@Component({
  selector: 'app-set-password-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
    AppIcon,
  ],
  templateUrl: './set-password-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SetPasswordPage {
  private readonly authDataSource = inject(AuthDataSource);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly formUtils = FormUtils;
  readonly isSubmitting = signal(false);
  readonly completed = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly linkCode = signal<string | null>(null);
  readonly isLinkMode = computed(() => this.linkCode() !== null);
  readonly form = this.formBuilder.nonNullable.group(
    {
      code: ['', [Validators.required, Validators.maxLength(100)]],
      newPassword: [
        '',
        [Validators.required, Validators.minLength(8), passwordStrengthValidator()],
      ],
      passwordConfirmation: ['', Validators.required],
    },
    { validators: [passwordMatchValidator('newPassword', 'passwordConfirmation')] },
  );

  readonly passwordMessages = {
    required: 'La nueva contraseña es obligatoria.',
    minlength: 'Debe tener al menos 8 caracteres.',
    missingLowercase: 'Debe incluir una letra minúscula.',
    missingUppercase: 'Debe incluir una letra mayúscula.',
    missingNumber: 'Debe incluir un número.',
    missingSymbol: 'Debe incluir un símbolo.',
  };

  constructor() {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code !== null) {
      this.linkCode.set(code);
      this.form.controls.code.setValue(code);
    }
  }

  formatCodeInput(event: Event): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    this.form.controls.code.setValue(this.formatCode(input.value), { emitEvent: false });
  }

  useAnotherCode(): void {
    this.linkCode.set(null);
    this.form.controls.code.reset();
    this.errorMessage.set(null);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { code: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.form.disable({ emitEvent: false });
    this.errorMessage.set(null);
    const value = this.form.getRawValue();
    this.authDataSource
      .completePasswordAction({
        code: this.linkCode() ?? value.code,
        newPassword: value.newPassword,
        passwordConfirmation: value.passwordConfirmation,
      })
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          if (!this.completed()) this.form.enable({ emitEvent: false });
        }),
      )
      .subscribe({
        next: () => {
          this.form.reset();
          this.linkCode.set(null);
          this.completed.set(true);
          void this.router.navigateByUrl('/login', {
            replaceUrl: true,
            state: { passwordActionCompleted: true },
          });
        },
        error: (error: HttpErrorResponse) => this.errorMessage.set(getAuthErrorMessage(error)),
      });
  }

  private formatCode(value: string): string {
    const characters = value.replace(/[\s-]/g, '').toUpperCase().slice(0, 30);
    return characters.match(/.{1,5}/g)?.join('-') ?? '';
  }
}
