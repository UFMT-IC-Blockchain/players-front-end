import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'jogos',
    loadComponent: () => import('./features/jogos/list-jogos/list-jogos.component').then(m => m.ListJogosComponent)
  },
  {
    path: '',
    redirectTo: 'jogos',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'jogos'
  }
];
