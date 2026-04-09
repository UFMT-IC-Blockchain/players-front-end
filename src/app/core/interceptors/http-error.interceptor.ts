import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { HttpErrorService } from '../services/http-error.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const httpErrorService = inject(HttpErrorService);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (!(err instanceof HttpErrorResponse)) {
        httpErrorService.showMessage('Ocorreu um erro inesperado.', 0);
        return throwError(() => err);
      }

      if (err.status === 401 && !req.url.includes('/auth/login')) {
        authService.logout();
        httpErrorService.showMessage('Sua sessão expirou. Faça login novamente.', 401);
        router.navigateByUrl('/login');
        return throwError(() => err);
      }

      if (err.status === 403) {
        httpErrorService.showMessage('Sem permissão para executar esta ação.', 403);
        return throwError(() => err);
      }

      if (err.status === 0) {
        httpErrorService.showMessage('Falha de conexão. Verifique sua internet e tente novamente.', 0);
        return throwError(() => err);
      }

      if (err.status >= 500) {
        httpErrorService.showMessage('Ocorreu um erro no servidor. Tente novamente em instantes.', err.status);
        return throwError(() => err);
      }

      return throwError(() => err);
    })
  );
};
