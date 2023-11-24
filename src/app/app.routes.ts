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
    title: 'Projects',
    data: {
      name: 'Projects',
      icon: 'inventory_2',
    },
    // loadComponent: () => import('./pages/projects/projects.component'),
    children: [
      {
        path: 'cavern-seer',
        title: 'CavernSeer',
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
    title: 'Contact',
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
