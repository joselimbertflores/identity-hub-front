import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { definePreset, palette } from '@primeuix/themes';
import { DialogService } from 'primeng/dynamicdialog';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import theme from '@primeuix/themes/aura';

import { authInterceptor } from './core';
import { routes } from './app.routes';

const primaryColor = palette('{sky}');
const AuraSky = definePreset(theme, {
  semantic: {
    primary: primaryColor,
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    providePrimeNG({
      ripple:true,
      theme: {
        preset: AuraSky,
        options: {
          darkModeSelector: false || 'none',
        },
      },
    }),
    MessageService,
    DialogService,
  ],
};
