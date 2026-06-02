import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ProblemDetails } from '../models/product.model';

/**
 * 🎯 DEMO: Interceptor de Error Handling
 *
 * Manejo centralizado de errores HTTP. Cada status code tiene
 * un significado y requiere una acción diferente.
 *
 * Puntos clave para la charla:
 * - 401 → Token expirado → Refresh automático → Reintentar request original
 * - 403 → No tienes permisos → Mostrar mensaje, NO reintentar
 * - 404 → Recurso no existe → UI debe manejar estado vacío
 * - 422 → Validación falló → Mostrar errores en formulario
 * - 429 → Rate limited → Esperar Retry-After header
 * - 500 → Error del servidor → Log + mensaje genérico al usuario
 *
 * ANTI-PATTERN: catch(e) { alert("Error") } — NO distingue nada
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 — Token expirado, intentar refresh
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Reintentar request original con nuevo token
            const newReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${authService.getToken()}`,
              },
            });
            return next(newReq);
          }),
          catchError(() => {
            // Refresh falló — logout
            authService.logout();
            return throwError(() => error);
          })
        );
      }

      // 429 — Rate Limited
      if (error.status === 429) {
        const retryAfter = error.headers.get('Retry-After');
        console.warn(`⏳ Rate limited. Retry after: ${retryAfter}s`);
        // En una app real, mostrarías un toast/snackbar
      }

      // Parsear error como ProblemDetails (RFC 7807) si es posible
      const problemDetails = parseProblemDetails(error);
      if (problemDetails) {
        console.error('🚨 API Error (RFC 7807):', problemDetails);
      }

      return throwError(() => error);
    })
  );
};

function parseProblemDetails(error: HttpErrorResponse): ProblemDetails | null {
  const body = error.error;
  if (body && typeof body === 'object' && 'type' in body && 'title' in body) {
    return body as ProblemDetails;
  }
  return null;
}
