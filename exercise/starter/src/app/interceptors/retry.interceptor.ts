import { HttpInterceptorFn } from '@angular/common/http';

/**
 * 🏋️ EJERCICIO: Implementar Retry Interceptor
 *
 * Requisitos:
 * 1. Solo reintentar métodos IDEMPOTENTES: GET, PUT, DELETE, HEAD, OPTIONS
 * 2. Solo reintentar en status: 503, 502, 504, 0 (network error)
 * 3. Máximo 3 reintentos
 * 4. Exponential backoff: 1000ms, 2000ms, 4000ms
 * 5. NO reintentar 4xx (esos son errores del cliente, reintentar no ayuda)
 *
 * Pistas:
 * - Usa el operador `retry` de RxJS con config object
 * - retry({ count: N, delay: (error, retryCount) => Observable })
 * - timer(ms) crea un Observable que emite después de ms milisegundos
 * - Math.pow(2, retryCount - 1) * 1000 = exponential backoff
 */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Implementar
  return next(req);
};
