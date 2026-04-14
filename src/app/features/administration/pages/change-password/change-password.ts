import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

import { FormUtils } from '../../../../helpers';
import {
  passwordMatchValidator,
  passwordStrengthValidator,
} from '../../utils/validators/password.validator';
import { AuthDataSource } from '../../services';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, PasswordModule, ButtonModule, FloatLabelModule, MessageModule],
  templateUrl: './change-password.html',
})
export default class ChangePassword {
  private router = inject(Router);
  private authDataSource = inject(AuthDataSource);
  private messageService = inject(MessageService);

  form: FormGroup = inject(FormBuilder).group(
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
