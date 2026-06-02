import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, tap } from 'rxjs';

/**
 * AuthService (proporcionado — NO modificar)
 * Simula autenticación para que los interceptors funcionen.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly token = signal<string | null>(null);

  login(username: string, password: string): Observable<{ token: string }> {
    return of({ token: 'test-jwt-token-' + Date.now() }).pipe(
      delay(200),
      tap(res => this.token.set(res.token))
    );
  }

  logout(): void {
    this.token.set(null);
  }

  getToken(): string | null {
    return this.token();
  }

  refreshToken(): Observable<{ token: string }> {
    return of({ token: 'refreshed-token-' + Date.now() }).pipe(
      delay(100),
      tap(res => this.token.set(res.token))
    );
  }
}
