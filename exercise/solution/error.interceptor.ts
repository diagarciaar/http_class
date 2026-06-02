import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ProblemDetails } from '../models/task.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 — Token expirado, intentar refresh
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${authService.getToken()}`,
              },
            });
            return next(newReq);
          }),
          catchError(() => {
            authService.logout();
            return throwError(() => error);
          })
        );
      }

      // 429 — Rate Limited
      if (error.status === 429) {
        const retryAfter = error.headers.get('Retry-After');
        console.warn(`⏳ Rate limited. Retry after: ${retryAfter}s`);
      }

      // Parsear como ProblemDetails si es posible
      const body = error.error;
      if (body && typeof body === 'object' && 'type' in body && 'title' in body) {
        console.error('🚨 API Error (RFC 7807):', body as ProblemDetails);
      }

      return throwError(() => error);
    })
  );
};
