import { ChangeDetectionStrategy, Component, computed, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';

import { ChangePasswordRequest } from '../../../../core/auth/auth.types';
import { FormUtils } from '../../../../helpers';
import {
  PASSWORD_RULES,
  passwordMatchValidator,
  passwordStrengthValidator,
} from '../../utils/validators/password.validator';

@Component({
  selector: 'app-password-change-form',
  imports: [ReactiveFormsModule, PasswordModule, ButtonModule, MessageModule],
  templateUrl: './password-change-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordChangeForm {
  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly submitLabel = input('Cambiar contraseña');
  readonly submitted = output<ChangePasswordRequest>();

  private readonly formBuilder = new FormBuilder();
  readonly form = this.formBuilder.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: [
        '',
        [Validators.required, Validators.minLength(8), passwordStrengthValidator()],
      ],
      passwordConfirmation: ['', Validators.required],
    },
    { validators: [passwordMatchValidator('newPassword', 'passwordConfirmation')] },
  );

  readonly formUtils = FormUtils;
  readonly currentPasswordMessages = { required: 'La contraseña actual es obligatoria.' };
  readonly passwordMessages = {
    required: 'La nueva contraseña es obligatoria.',
    minlength: 'Debe tener al menos 8 caracteres.',
    missingLowercase: 'Debe incluir una letra minúscula.',
    missingUppercase: 'Debe incluir una letra mayúscula.',
    missingNumber: 'Debe incluir un número.',
    missingSymbol: 'Debe incluir un símbolo.',
  };

  private readonly passwordValue = toSignal(this.form.controls.newPassword.valueChanges, {
    initialValue: this.form.controls.newPassword.value,
  });

  readonly passwordRequirements = computed(() => {
    const password = this.passwordValue();
    return [
      { label: 'Mínimo 8 caracteres.', valid: password.length >= PASSWORD_RULES.minLength },
      { label: 'Al menos una letra mayúscula.', valid: PASSWORD_RULES.uppercase.test(password) },
      { label: 'Al menos una letra minúscula.', valid: PASSWORD_RULES.lowercase.test(password) },
      { label: 'Al menos un número.', valid: PASSWORD_RULES.number.test(password) },
      { label: 'Al menos un símbolo.', valid: PASSWORD_RULES.symbol.test(password) },
    ];
  });

  constructor() {
    effect(() => {
      if (this.loading()) {
        this.form.disable({ emitEvent: false });
      } else {
        this.form.enable({ emitEvent: false });
      }
    });
  }

  submit(): void {
    if (this.loading()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  reset(): void {
    this.form.reset();
  }
}
