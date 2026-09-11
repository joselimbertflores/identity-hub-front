export interface NavigationItem {
  label: string;
  routerLink: string;
  icon: string;
  roles?: string[];
}

export const MENU_ACTIONS: NavigationItem[] = [
  {
    label: 'Usuarios',
    routerLink: '/home/users',
    icon: 'lucideUsers',
    roles: ['ADMIN'],
  },
  {
    label: 'Sistemas',
    routerLink: '/home/applications',
    icon: 'lucideBox',
    roles: ['ADMIN'],
  },
  {
    label: 'Mis sistemas',
    routerLink: '/home/apps',
    icon: 'lucideLayoutGrid',
  },
];
