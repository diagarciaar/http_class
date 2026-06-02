import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';

/**
 * 🎯 DEMO: Flujo de Autenticación
 *
 * Muestra el ciclo completo:
 * 1. Login → obtener token
 * 2. Request con token → éxito
 * 3. Token expira → 401 → refresh automático → retry
 * 4. Refresh falla → logout
 *
 * Puntos clave:
 * - Bearer token en Authorization header
 * - El interceptor agrega el token automáticamente (DRY)
 * - Tokens en MEMORIA (signal), NO en localStorage (XSS vulnerable)
 * - httpOnly cookies son más seguros para refresh tokens
 */
@Component({
  selector: 'app-auth-flow',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <div class="container">
      <h1>🔐 Auth Flow Demo</h1>
      <p class="subtitle">Login → Token → Request → Refresh → Retry. Todo automático con interceptors.</p>

      <section class="demo-section">
        <h2>Estado actual</h2>
        <div class="status-card" [class.authenticated]="authService.isAuthenticated$()">
          <span class="status-icon">{{ authService.isAuthenticated$() ? '🟢' : '🔴' }}</span>
          <span>{{ authService.isAuthenticated$() ? 'Autenticado' : 'No autenticado' }}</span>
          @if (authService.getToken(); as token) {
            <code class="token-display">{{ token }}</code>
          }
        </div>
      </section>

      <section class="demo-section">
        <h2>1. Autenticación</h2>
        <div class="button-group">
          <button class="btn-success" (click)="login()">🔑 Login (obtener token)</button>
          <button class="btn-danger" (click)="logout()">🚪 Logout (borrar token)</button>
        </div>
      </section>

      <section class="demo-section">
        <h2>2. Requests con/sin token</h2>
        <div class="button-group">
          <button (click)="requestWithToken()">
            📡 GET /products (con token automático)
          </button>
          <button class="btn-warning" (click)="requestWithoutToken()">
            ⚠️ GET /products (sin token — simula 401)
          </button>
        </div>
        <p class="hint">💡 Revisa Network tab → Headers → Authorization: Bearer ...</p>
      </section>

      <section class="demo-section">
        <h2>3. Refresh Token Flow</h2>
        <div class="button-group">
          <button class="btn-info" (click)="simulateTokenExpiry()">
            ⏰ Simular token expirado → refresh → retry
          </button>
        </div>
        <p class="hint">💡 El interceptor detecta 401, hace refresh, y reintenta la request original</p>
      </section>

      <section class="demo-section">
        <h2>⚠️ Dónde guardar tokens</h2>
        <div class="comparison">
          <div class="comparison-col bad">
            <h3>❌ localStorage / sessionStorage</h3>
            <ul>
              <li>Accesible por JavaScript → vulnerable a XSS</li>
              <li>Cualquier script inyectado puede robar el token</li>
              <li>Persiste entre tabs (localStorage)</li>
            </ul>
          </div>
          <div class="comparison-col good">
            <h3>✅ Memoria (variable/signal) + httpOnly cookie</h3>
            <ul>
              <li>Access token en memoria → se pierde al cerrar tab</li>
              <li>Refresh token en httpOnly cookie → JS NO puede leerlo</li>
              <li>El browser envía la cookie automáticamente</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="demo-section">
        <h2>📋 Log</h2>
        <div class="response-box">
          @for (entry of log(); track $index) {
            <div class="log-entry" [class.error]="entry.type === 'error'" [class.success]="entry.type === 'success'">
              <span class="log-time">{{ entry.time }}</span>
              <span>{{ entry.message }}</span>
            </div>
          }
          @empty {
            <p class="empty">Haz click en los botones para ver el flujo...</p>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .container { font-family: system-ui; }
    .subtitle { color: #666; margin-bottom: 2rem; }
    .demo-section { margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; }
    .demo-section h2 { margin-top: 0; }
    .button-group { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
    button {
      padding: 0.6rem 1.2rem; border: none; border-radius: 6px;
      background: #4f46e5; color: white; cursor: pointer; font-size: 0.85rem;
    }
    .btn-success { background: #10b981; }
    .btn-danger { background: #dc2626; }
    .btn-warning { background: #f59e0b; }
    .btn-info { background: #0ea5e9; }
    .hint { font-size: 0.8rem; color: #6b7280; margin-top: 0.5rem; }
    .status-card {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1rem; background: #fef2f2; border-radius: 8px; border: 1px solid #fca5a5;
    }
    .status-card.authenticated { background: #f0fdf4; border-color: #86efac; }
    .status-icon { font-size: 1.2rem; }
    .token-display {
      font-size: 0.7rem; background: #1e1e2e; color: #a6e3a1;
      padding: 0.2rem 0.5rem; border-radius: 4px; margin-left: auto;
    }
    .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .comparison-col { padding: 1rem; border-radius: 8px; }
    .comparison-col.bad { background: #fef2f2; border: 1px solid #fca5a5; }
    .comparison-col.good { background: #f0fdf4; border: 1px solid #86efac; }
    .comparison-col h3 { margin-top: 0; font-size: 0.9rem; }
    .comparison-col ul { font-size: 0.8rem; padding-left: 1.2rem; }
    .response-box {
      background: #1e1e2e; padding: 1rem; border-radius: 8px;
      max-height: 300px; overflow-y: auto;
    }
    .log-entry {
      font-size: 0.8rem; color: #cdd6f4; padding: 0.3rem 0;
      border-bottom: 1px solid #313244; display: flex; gap: 0.5rem;
    }
    .log-entry.error { color: #f38ba8; }
    .log-entry.success { color: #a6e3a1; }
    .log-time { color: #6c7086; min-width: 80px; }
    .empty { color: #6c7086; font-size: 0.85rem; }
  `],
})
export class AuthFlowComponent {
  readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);
  readonly log = signal<Array<{ time: string; message: string; type: string }>>([]);

  login(): void {
    this.addLog('🔑 Intentando login...', 'info');
    this.authService.login('demo-user', 'password123').subscribe({
      next: (res) => {
        this.addLog(`✅ Login exitoso. Token: ${res.token.slice(0, 20)}...`, 'success');
        this.addLog('💡 Token guardado en MEMORIA (signal), no en localStorage', 'info');
      },
      error: () => this.addLog('❌ Login falló', 'error'),
    });
  }

  logout(): void {
    this.authService.logout();
    this.addLog('🚪 Logout — token eliminado de memoria', 'info');
  }

  requestWithToken(): void {
    if (!this.authService.getToken()) {
      this.addLog('⚠️ No hay token — haz login primero', 'error');
      return;
    }

    this.addLog('📡 GET /products — el interceptor agrega Authorization header automáticamente', 'info');
    this.http.get('http://localhost:3000/products').pipe(
      catchError((err: HttpErrorResponse) => {
        this.addLog(`❌ Error: ${err.status} ${err.statusText}`, 'error');
        return throwError(() => err);
      })
    ).subscribe((res) => {
      const count = Array.isArray(res) ? res.length : 0;
      this.addLog(`✅ Response OK — ${count} productos recibidos`, 'success');
      this.addLog('💡 Revisa Network tab → Request Headers → Authorization: Bearer ...', 'info');
    });
  }

  requestWithoutToken(): void {
    this.addLog('⚠️ Simulando request SIN token (como si expirara)...', 'info');
    this.addLog('📡 El server respondería 401 Unauthorized', 'error');
    this.addLog('🔄 El error interceptor detecta 401 → intenta refresh token', 'info');
    this.addLog('✅ Si refresh funciona → reintenta request original con nuevo token', 'success');
    this.addLog('❌ Si refresh falla → logout automático', 'error');
  }

  simulateTokenExpiry(): void {
    this.addLog('⏰ Simulando expiración de token...', 'info');
    this.addLog('1️⃣ Request original enviada con token expirado', 'info');
    this.addLog('2️⃣ Server responde 401 Unauthorized', 'error');
    this.addLog('3️⃣ Error interceptor detecta 401', 'info');
    this.addLog('4️⃣ Interceptor llama POST /auth/refresh', 'info');

    // Simular el refresh
    this.authService.refreshToken().subscribe({
      next: (res) => {
        this.addLog(`5️⃣ ✅ Nuevo token obtenido: ${res.token.slice(0, 20)}...`, 'success');
        this.addLog('6️⃣ Request original reintentada con nuevo token', 'info');
        this.addLog('7️⃣ ✅ Response exitosa — el usuario NO se enteró de nada', 'success');
        this.addLog('', 'info');
        this.addLog('💡 Todo esto pasa en el interceptor. El componente NO sabe que hubo un 401.', 'info');
      },
    });
  }

  private addLog(message: string, type: string): void {
    const time = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.log.update(entries => [...entries, { time, message, type }]);
  }
}
