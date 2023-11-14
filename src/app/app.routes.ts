import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home'),
    data: {
      name: 'Home',
      icon: 'home',
    },
  },
  {
    path: 'projects',
    data: {
      name: 'Projects',
      icon: 'inventory_2',
    },
    children: [

    ]
  },
  {
    path: '**',
    redirectTo: '',
  },
];
