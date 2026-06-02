import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const idempotentMethods = ['GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'];

  if (!idempotentMethods.includes(req.method)) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: 3,
      delay: (error, retryCount) => {
        const retryableStatuses = [503, 502, 504, 0];
        const status = error?.status ?? 0;

        if (!retryableStatuses.includes(status)) {
          throw error;
        }

        const delayMs = Math.pow(2, retryCount - 1) * 1000;
        console.warn(`🔄 Retry #${retryCount} for ${req.method} ${req.url} in ${delayMs}ms`);
        return timer(delayMs);
      },
    })
  );
};
