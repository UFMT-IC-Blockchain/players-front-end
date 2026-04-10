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
    path: 'roles',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/roles/minhas-roles/minhas-roles.component').then(
        m => m.MinhasRolesComponent
      )
  },
  {
    path: 'recompensas',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/recompensas/recompensas.component').then(
        m => m.RecompensasComponent
      )
  },
  {
    path: 'jogos/criar',
    canMatch: [authGuard],
    loadComponent: () => import('./features/jogos/criacao-jogo/criacao-jogo.component').then(m => m.CriacaoJogoComponent)
  },
  {
    path: 'jogos/:id',
    canMatch: [authGuard],
    loadComponent: () => import('./features/jogos/jogo-detail/jogo-detail.component').then(m => m.JogoDetailComponent)
  },
  {
    path: 'jogadores/busca',
    canMatch: [authGuard],
    loadComponent: () => import('./features/jogadores/busca-jogador/busca-jogador.component').then(m => m.BuscaJogadorComponent)
  },
  {
    path: 'times/:id',
    canMatch: [authGuard],
    loadComponent: () => import('./features/times/time-detail-stub/time-detail-stub.component').then(m => m.TimeDetailComponent)
  },
  {
    path: 'times',
    canMatch: [authGuard],
    loadComponent: () => import('./features/times/list-times/list-times.component').then(m => m.ListTimesComponent)
  },
  {
    path: 'estatisticas/top',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/estatisticas/top-scorers/top-scorers.component').then(
        m => m.TopScorersComponent
      )
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
