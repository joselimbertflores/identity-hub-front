import { AbstractControl } from '@angular/forms';

type customMessages = Record<string, string>;
export class FormUtils {
  static isInvalid(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
  static getErrorMessage(control: AbstractControl | null, messages?: customMessages) {
    if (!control || !control.errors || !(control.touched || control.dirty)) {
      return null;
    }

    const errors = control.errors;

    for (const key of Object.keys(errors)) {
      if (messages && messages[key]) {
        return messages[key];
      }

      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'minlength':
          return `Mínimo de ${errors['minlength'].requiredLength} caracteres.`;
        case 'maxlength':
          return `Máximo de ${errors['maxlength'].requiredLength} caracteres`;
        case 'pattern':
          return 'Formato inválido';
        default:
          return 'Campo inválido';
      }
    }
    return null;
  }
}
