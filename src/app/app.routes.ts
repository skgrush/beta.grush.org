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
    // loadComponent: () => import('./pages/projects/projects.component'),
    children: [
      {
        path: 'cavern-seer',
        data: {
          name: 'CavernSeer X',
          icon: 'golf_course',
        },
        children: [],
      },
    ]
  },
  {
    path: '**',
    redirectTo: '',
  },
];
