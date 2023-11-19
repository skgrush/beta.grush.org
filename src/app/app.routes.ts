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
          name: 'CavernSeer',
          icon: 'golf_course',
        },
        loadComponent: () => import('./pages/projects/cavern-seer/cavern-seer.component'),
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  },
  {
    path: 'contact',
    data: {
      name: 'Contact',
      icon: 'contact_page',
    },
    loadComponent: () => import('./pages/contact/contact.component'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
