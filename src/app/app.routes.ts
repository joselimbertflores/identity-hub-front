import { Routes } from '@angular/router';
import {
  roleGuard,
  isAuthenticatedGuard,
  isNotAuthenticatedGuard,
  mustChangePasswordGuard,
  canAccessChangePasswordGuard,
} from './core/auth/guards';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Inicio de Sesion',
    canActivate: [isNotAuthenticatedGuard],
    loadComponent: () => import('./features/auth/pages/login-page/login-page'),
  },
  {
    path: 'change-password',
    title: 'Actualizar contraseña',
    canActivate: [canAccessChangePasswordGuard],
    loadComponent: () => import('./features/auth/pages/change-password-page/change-password-page'),
  },
  {
    path: 'auth/error',
    loadComponent: () => import('./features/auth/pages/auth-error-page/auth-error-page'),
  },
  {
    path: 'home',
    title: 'Inicio',
    canActivate: [isAuthenticatedGuard],
    canActivateChild: [mustChangePasswordGuard],
    loadComponent: () => import('./layout/app-layout/app-layout'),
    children: [
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
        canActivate: [roleGuard],
        data: { roles: ['USER'] },
        loadComponent: () => import('./features/access-portal/pages/my-access-page/my-access-page'),
      },
      {
        path: 'welcome',
        title: 'Bienvenida',
        loadComponent: () => import('./features/workspace/pages/welcome-page/welcome-page'),
      },
      {
        path: 'settings',
        title: 'Configuraciones',
        loadComponent: () => import('./features/workspace/pages/settings-page/settings-page'),
      },
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
