import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest.guard';
import { authGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: 'login',
    canMatch: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  

  {
    path: 'jogos',
    canMatch: [authGuard],
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
