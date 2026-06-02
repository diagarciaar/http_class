import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'examples',
    pathMatch: 'full',
  },
  {
    path: 'examples',
    loadComponent: () =>
      import('./pages/examples/examples.component').then(m => m.ExamplesComponent),
  },
  {
    path: 'cors',
    loadComponent: () =>
      import('./pages/cors-demo/cors-demo.component').then(m => m.CorsDemoComponent),
  },
  {
    path: 'error-handling',
    loadComponent: () =>
      import('./pages/error-handling/error-handling.component').then(m => m.ErrorHandlingComponent),
  },
  {
    path: 'auth-flow',
    loadComponent: () =>
      import('./pages/auth-flow/auth-flow.component').then(m => m.AuthFlowComponent),
  },
];
