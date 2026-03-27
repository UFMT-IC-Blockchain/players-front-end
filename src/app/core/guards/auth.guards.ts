import {injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';

export const authGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (token) {
    return true;
  }

  return router.createUrlTree(['/login']);