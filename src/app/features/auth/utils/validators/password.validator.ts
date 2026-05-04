import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PASSWORD_RULES = {
  minLength: 8,
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  number: /\d/,
  symbol: /[^\w\s]/,
} as const;

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value ?? '';

    if (!value) return null;

    const errors: ValidationErrors = {};

    if (!PASSWORD_RULES.lowercase.test(value)) errors['missingLowercase'] = true;
    if (!PASSWORD_RULES.uppercase.test(value)) errors['missingUppercase'] = true;
    if (!PASSWORD_RULES.number.test(value)) errors['missingNumber'] = true;
    if (!PASSWORD_RULES.symbol.test(value)) errors['missingSymbol'] = true;

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
