import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

/**
 * 🎯 DEMO: Interceptor de Logging
 *
 * Muestra en consola CADA request y response que pasa por HttpClient.
 * Perfecto para la demo en vivo — los asistentes ven exactamente
 * qué está pasando bajo el capó.
 *
 * En producción usarías algo más sofisticado (telemetría, APM),
 * pero el concepto es el mismo: interceptar el pipeline HTTP.
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = performance.now();

  console.group(`🌐 ${req.method} ${req.url}`);
  console.log('Headers:', req.headers.keys().map(k => `${k}: ${req.headers.get(k)}`));

  if (req.body) {
    console.log('Body:', req.body);
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type !== 0) { // Skip HttpSentEvent
          const duration = Math.round(performance.now() - startTime);
          console.log(`✅ Response in ${duration}ms`, event);
          console.groupEnd();
        }
      },
      error: (error) => {
        const duration = Math.round(performance.now() - startTime);
        console.error(`❌ Error in ${duration}ms`, error);
        console.groupEnd();
      },
    })
  );
};
