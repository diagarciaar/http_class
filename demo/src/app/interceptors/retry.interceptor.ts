import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

/**
 * 🎯 DEMO: Interceptor de Retry con Exponential Backoff
 *
 * Cuando el servidor responde 503 (Service Unavailable) o hay
 * errores de red, reintentamos automáticamente con backoff exponencial.
 *
 * Puntos clave para la charla:
 * - 503 = "estoy ocupado, intenta después" → REINTENTAR tiene sentido
 * - 400/404 = "tu request está mal" → REINTENTAR NO tiene sentido
 * - Exponential backoff: 1s, 2s, 4s... evita thundering herd
 * - Solo métodos idempotentes (GET, PUT, DELETE) son safe de reintentar
 * - POST NO es idempotente — reintentar puede crear duplicados
 */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo reintentar métodos idempotentes
  const idempotentMethods = ['GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];

  if (!idempotentMethods.includes(req.method)) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: 3,
      delay: (error, retryCount) => {
        // Solo reintentar en errores de servidor o red
        const retryableStatuses = [503, 502, 504, 0]; // 0 = network error
        const status = error?.status ?? 0;

        if (!retryableStatuses.includes(status)) {
          throw error; // No reintentar 4xx
        }

        // Exponential backoff: 1000ms, 2000ms, 4000ms
        const delayMs = Math.pow(2, retryCount - 1) * 1000;
        console.warn(
          `🔄 Retry #${retryCount} for ${req.method} ${req.url} in ${delayMs}ms (status: ${status})`
        );

        return timer(delayMs);
      },
    })
  );
};
