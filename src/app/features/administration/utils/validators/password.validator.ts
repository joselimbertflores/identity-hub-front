import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value ?? '';

    if (!value) return null;

    const errors: ValidationErrors = {};

    if (!/[a-z]/.test(value)) errors['missingLowercase'] = true;
    if (!/[A-Z]/.test(value)) errors['missingUppercase'] = true;
    if (!/\d/.test(value)) errors['missingNumber'] = true;
    if (!/[^\w\s]/.test(value)) errors['missingSymbol'] = true;

    return Object.keys(errors).length ? errors : null;
  };
}

export function passwordMatchValidator(
  passwordField = 'password',
  confirmField = 'confirmPassword',
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordField)?.value;
    const confirmPassword = group.get(confirmField)?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}
