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
    path: 'forgot-password',
    title: 'Recuperar acceso',
    loadComponent: () => import('./features/auth/pages/forgot-password-page/forgot-password-page'),
  },
  {
    path: 'set-password',
    title: 'Establecer nueva contraseña',
    loadComponent: () => import('./features/auth/pages/set-password-page/set-password-page'),
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
        loadComponent: () => import('./features/access-portal/pages/my-access-page/my-access-page'),
      },
      {
        path: '',
        title: 'Inicio',
        loadComponent: () => import('./features/workspace/pages/home-page/home-page'),
      },
      {
        path: 'settings',
        title: 'Configuración',
        loadComponent: () => import('./features/workspace/pages/settings-page/settings-page'),
      },
    ],
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
