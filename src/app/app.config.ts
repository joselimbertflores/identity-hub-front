import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideBox,
  lucideCheck,
  lucideCircle,
  lucideCircleCheck,
  lucideCodeXml,
  lucideCopy,
  lucideEllipsisVertical,
  lucideEye,
  lucideEyeOff,
  lucideKeyRound,
  lucideLayoutGrid,
  lucideLogIn,
  lucideLogOut,
  lucideMenu,
  lucidePencil,
  lucidePlus,
  lucideRotateCcw,
  lucideSearch,
  lucideSend,
  lucideSettings,
  lucideShieldCheck,
  lucideTriangleAlert,
  lucideUser,
  lucideUsers,
  lucideX,
} from '@ng-icons/lucide';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';

import { authInterceptor, httpErrorInterceptor } from './core';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withXhr(), withInterceptors([authInterceptor, httpErrorInterceptor])),
    provideRouter(routes, withViewTransitions()),
    provideSpartanHlm(),
    provideIcons({
      lucideArrowLeft,
      lucideArrowRight,
      lucideBox,
      lucideCheck,
      lucideCircle,
      lucideCircleCheck,
      lucideCodeXml,
      lucideCopy,
      lucideEllipsisVertical,
      lucideEye,
      lucideEyeOff,
      lucideKeyRound,
      lucideLayoutGrid,
      lucideLogIn,
      lucideLogOut,
      lucideMenu,
      lucidePencil,
      lucidePlus,
      lucideRotateCcw,
      lucideSearch,
      lucideSend,
      lucideSettings,
      lucideShieldCheck,
      lucideTriangleAlert,
      lucideUser,
      lucideUsers,
      lucideX,
    }),
  ],
};
