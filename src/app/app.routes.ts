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
    loadComponent: () => import('./features/administration/pages/change-password/change-password'),
  },
  {
    path: 'home',
    title: 'Inicio',
    canActivate: [isAuthenticatedGuard],
    canActivateChild: [mustChangePasswordGuard],
    loadComponent: () => import('./features/administration/layout/admin-layout/admin-layout'),
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
        path: 'welcome',
        title: 'Bienvenido/a',
        loadComponent: () => import('./features/administration/pages/welcome-page/welcome-page'),
      },
      {
        path: 'settings',
        title: 'Configuraciones',
        loadComponent: () => import('./features/administration/pages/settings-page/settings-page'),
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
