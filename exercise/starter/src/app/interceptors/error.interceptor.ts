import { HttpInterceptorFn } from '@angular/common/http';

/**
 * 🏋️ EJERCICIO: Implementar Error Interceptor
 *
 * Requisitos:
 * 1. Capturar errores HTTP con catchError
 * 2. En 401 (y NO es /auth/refresh):
 *    - Llamar authService.refreshToken()
 *    - Si refresh OK → reintentar request original con nuevo token
 *    - Si refresh falla → logout + propagar error
 * 3. En 429: loggear console.warn con el valor del header 'Retry-After'
 * 4. Intentar parsear el error body como ProblemDetails (RFC 7807):
 *    - Si body tiene 'type' y 'title' → es ProblemDetails → loggear
 * 5. SIEMPRE propagar el error con throwError(() => error)
 *
 * Pistas:
 * - catchError((error: HttpErrorResponse) => { ... })
 * - switchMap para encadenar el refresh + retry
 * - error.headers.get('Retry-After') para leer headers
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Implementar
  return next(req);
};
