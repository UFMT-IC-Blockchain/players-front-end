import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RolesService } from '../services/roles.service';

export const authGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const adminGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const rolesService = inject(RolesService);
  const router = inject(Router);

  const tokenHasAdmin = authService.hasRoleFromToken('ADMIN');
  if (tokenHasAdmin === true) {
    return true;
  }
  if (tokenHasAdmin === false) {
    return router.createUrlTree(['/jogos']);
  }

  return rolesService.getRoles().pipe(
    map((roles) => {
      const isAdmin = roles.some((role) => role.nome.trim().toUpperCase() === 'ADMIN');
      return isAdmin ? true : router.createUrlTree(['/jogos']);
    }),
    catchError(() => of(router.createUrlTree(['/jogos'])))
  );
};
