import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * 🎯 DEMO: Interceptor de Autenticación
 *
 * Agrega el Bearer token a CADA request automáticamente.
 * El frontend NO debería estar pegando tokens manualmente en cada fetch.
 *
 * Puntos clave para la charla:
 * - Authorization header con esquema Bearer
 * - El interceptor centraliza la lógica (DRY)
 * - Si el token expira, el error interceptor maneja el refresh
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // No agregar token a requests que no lo necesitan
  if (!token || req.url.includes('/auth/login')) {
    return next(req);
  }

  // Clonar el request con el header Authorization
  // Los requests en Angular son INMUTABLES — siempre se clonan
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
