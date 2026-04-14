import { MenuItem } from 'primeng/api';

export const MENU_ACTIONS: MenuItem[] = [
  {
    label: 'Usuarios',
    routerLink: '/home/users',
    icon: 'pi-users',
    roles: ['ADMIN'],
  },
  {
    label: 'Sistemas',
    routerLink: '/home/applications',
    icon: 'pi-box',
    roles: ['ADMIN'],
  },
  {
    label: 'Mis sistemas',
    routerLink: '/home/apps',
    icon: 'pi-th-large',
    roles: ['USER'],
  },
];
