import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

import { finalize } from 'rxjs';

import { AuthDataSource } from '../../../../core';
import { FormUtils } from '../../../../helpers';
import {
  passwordMatchValidator,
  passwordStrengthValidator,
} from '../../../auth/utils/validators/password.validator';

@Component({
  selector: 'app-settings-page',
  imports: [ReactiveFormsModule, PasswordModule, ButtonModule, FloatLabelModule, MessageModule],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsPage {
  private authDataSource = inject(AuthDataSource);

  formUtils = FormUtils;
  userForm: FormGroup = inject(FormBuilder).group(
    {
      password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required],
    },
    { validators: [passwordMatchValidator()] },
  );

  user = this.authDataSource.user;

  readonly passwordMessages = {
    required: 'La nueva contraseña es obligatoria.',
    minlength: 'Debe tener al menos 8 caracteres.',
    missingLowercase: 'Debe incluir una letra minúscula.',
    missingUppercase: 'Debe incluir una letra mayúscula.',
    missingNumber: 'Debe incluir un número.',
    missingSymbol: 'Debe incluir un símbolo.',
  };

  displayMessage = signal(false);
  isSaving = signal(false);

  save() {
    if (this.userForm.invalid || this.isSaving()) {
      this.userForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const { password } = this.userForm.value;
    this.authDataSource
      .changePassword(password)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe(() => {
        this.userForm.reset();
        this.showMessage();
      });
  }

  private showMessage() {
    this.displayMessage.set(true);
    setTimeout(() => {
      this.displayMessage.set(false);
    }, 3000);
  }
}
