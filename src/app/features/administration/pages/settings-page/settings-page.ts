import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  ReactiveFormsModule,
  ValidationErrors,
  AbstractControl,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { FloatLabelModule } from 'primeng/floatlabel';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

import { AuthDataSource } from '../../../../core';
import { FormUtils } from '../../../../helpers';

@Component({
  selector: 'app-settings-page',
  imports: [ReactiveFormsModule, PasswordModule, ButtonModule, FloatLabelModule, MessageModule],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsPage {
  private authDataSource = inject(AuthDataSource);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  formUtils = FormUtils;
  userForm: FormGroup = inject(FormBuilder).nonNullable.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'),
        ],
      ],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
  );

  user = this.authDataSource.user;
  isRequiredPasswordChange = this.route.snapshot.data['requiredPasswordChange'] === true;

  protected readonly errorMessages = {
    password: {
      pattern: 'Ingrese al menos una letra minúscula, una mayúscula y un número',
    },
    confirmPassword: {
      mismatch: 'Las contraseñas no coinciden',
    },
  };
  displayMessage = signal(false);

  save() {
    const { password } = this.userForm.value;
    this.authDataSource.updateProfile(password).subscribe(() => {
      this.userForm.reset();
      if (this.isRequiredPasswordChange) {
        this.router.navigate(['/home/welcome']);
        return;
      }
      this.showMessage();
    });
  }

  private showMessage() {
    this.displayMessage.set(true);
    setTimeout(() => {
      this.displayMessage.set(false);
    }, 3000);
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }
}
