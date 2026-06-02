import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, tap } from 'rxjs';

/**
 * 🎯 DEMO: Servicio de Autenticación (Mock)
 *
 * Simula un flujo de auth con tokens para la demo.
 * En producción esto se conectaría a un identity provider real.
 *
 * Puntos clave para la charla:
 * - Token se guarda en memoria (signal), NO en localStorage
 * - localStorage es accesible por XSS — httpOnly cookies son más seguros
 * - Para la demo usamos signal para que sea reactivo
 * - Refresh token flow: token expira → interceptor detecta 401 → refresh → retry
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly token = signal<string | null>(null);
  private readonly isAuthenticated = signal(false);

  readonly isAuthenticated$ = this.isAuthenticated;

  login(username: string, password: string): Observable<{ token: string }> {
    // Simular login — en producción sería un POST /auth/login
    return of({ token: 'fake-jwt-token-' + Date.now() }).pipe(
      delay(500),
      tap(response => {
        this.token.set(response.token);
        this.isAuthenticated.set(true);
        console.log('🔐 Logged in, token stored in memory (NOT localStorage!)');
      })
    );
  }

  logout(): void {
    this.token.set(null);
    this.isAuthenticated.set(false);
    console.log('🔓 Logged out, token cleared');
  }

  getToken(): string | null {
    return this.token();
  }

  refreshToken(): Observable<{ token: string }> {
    // Simular refresh — en producción sería POST /auth/refresh con httpOnly cookie
    console.log('🔄 Refreshing token...');
    return of({ token: 'refreshed-jwt-token-' + Date.now() }).pipe(
      delay(300),
      tap(response => {
        this.token.set(response.token);
        console.log('✅ Token refreshed');
      })
    );
  }
}
