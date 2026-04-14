import { Routes } from '@angular/router';
import {
  isAuthenticatedGuard,
  isNotAuthenticatedGuard,
  mustChangePasswordGuard,
  requiredPasswordChangeGuard,
  roleGuard,
} from './features/administration/guards';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Inicio de Sesion',
    canActivate: [isNotAuthenticatedGuard],
    loadComponent: () => import('./features/auth/pages/login-page/login-page'),
  },
  {
    path: 'home',
    title: 'Inicio',
    canActivate: [isAuthenticatedGuard],
    canActivateChild: [mustChangePasswordGuard],
    loadComponent: () => import('./features/administration/layout/admin-layout/admin-layout'),
    children: [
      {
        path: 'welcome',
        title: 'Bienvenido/a',
        loadComponent: () => import('./features/administration/pages/welcome-page/welcome-page'),
      },
      {
        path: 'change-password',
        title: 'Actualizar contraseña',
        canActivate: [requiredPasswordChangeGuard],
        data: { requiredPasswordChange: true },
        loadComponent: () =>
          import('./features/administration/pages/change-password-page/change-password-page'),
      },
      {
        path: 'settings',
        title: 'Configuraciones',
        loadComponent: () => import('./features/administration/pages/settings-page/settings-page'),
      },
      {
        path: 'users',
        title: 'Usuarios',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/administration/pages/user-admin/user-admin'),
      },
      {
        path: 'applications',
        title: 'Sistemas',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./features/administration/pages/application-admin/application-admin'),
      },
      {
        path: 'apps',
        title: 'Mis sistemas',
        loadComponent: () => import('./features/access-portal/pages/my-access/my-access'),
      },
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
