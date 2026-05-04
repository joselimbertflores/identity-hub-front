import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { FormUtils } from '../../../../helpers';
import {
  PASSWORD_RULES,
  passwordMatchValidator,
  passwordStrengthValidator,
} from '../../utils/validators/password.validator';
import { AuthDataSource } from '../../../../core';

@Component({
  selector: 'app-change-password-page',
  imports: [ReactiveFormsModule, PasswordModule, ButtonModule, FloatLabelModule, MessageModule],
  templateUrl: './change-password-page.html',
})
export default class ChangePasswordPage {
  private router = inject(Router);
  private authDataSource = inject(AuthDataSource);
  private messageService = inject(MessageService);

  form: FormGroup = inject(FormBuilder).nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required],
    },
    { validators: [passwordMatchValidator()] },
  );

  isLoading = signal(false);
  formUtils = FormUtils;

  readonly passwordMessages = {
    required: 'La nueva contraseña es obligatoria.',
    minlength: 'Debe tener al menos 8 caracteres.',
    missingLowercase: 'Debe incluir una letra minúscula.',
    missingUppercase: 'Debe incluir una letra mayúscula.',
    missingNumber: 'Debe incluir un número.',
    missingSymbol: 'Debe incluir un símbolo.',
  };

  private readonly passwordValue = toSignal(this.form.controls['password'].valueChanges, {
    initialValue: this.form.controls['password'].value,
  });

  readonly passwordRequirements = computed(() => {
    const password = this.passwordValue();
    return [
      {
        label: 'Mínimo 8 caracteres.',
        valid: password.length >= PASSWORD_RULES.minLength,
      },
      {
        label: 'Al menos una letra mayúscula.',
        valid: PASSWORD_RULES.uppercase.test(password),
      },
      {
        label: 'Al menos una letra minúscula.',
        valid: PASSWORD_RULES.lowercase.test(password),
      },
      {
        label: 'Al menos un número.',
        valid: PASSWORD_RULES.number.test(password),
      },
      {
        label: 'Al menos un símbolo.',
        valid: PASSWORD_RULES.symbol.test(password),
      },
    ];
  });

  submit(): void {
    if (this.isLoading()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const { password } = this.form.value;

    this.authDataSource.changePassword(password).subscribe({
      next: () => {
        this.form.reset();
        this.isLoading.set(false);

        this.messageService.add({
          severity: 'success',
          summary: 'Cambios guardados',
          detail: 'La contraseña ha sido actualizada.',
        });

        this.router.navigateByUrl('/home/welcome');
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
