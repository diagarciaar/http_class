import { HttpInterceptorFn } from '@angular/common/http';

/**
 * 🏋️ EJERCICIO: Implementar Auth Interceptor
 *
 * Requisitos:
 * 1. Obtener token del AuthService (inject)
 * 2. Si NO hay token o la URL contiene '/auth/', pasar sin modificar
 * 3. Si hay token, clonar el request y agregar header:
 *    Authorization: Bearer <token>
 *
 * Pistas:
 * - Los requests en Angular son INMUTABLES — usa req.clone()
 * - inject(AuthService) funciona dentro de interceptors funcionales
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // TODO: Implementar
  return next(req);
};
