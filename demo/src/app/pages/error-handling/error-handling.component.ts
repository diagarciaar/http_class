import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { catchError, throwError } from 'rxjs';

/**
 * 🎯 DEMO: Error Handling por Status Code
 *
 * Muestra cómo cada status code requiere un manejo DIFERENTE.
 * El anti-pattern es: catch(e) { alert("Error") }
 *
 * Puntos clave:
 * - 4xx = el CLIENTE hizo algo mal → mostrar al usuario qué corregir
 * - 5xx = el SERVIDOR falló → reintentar o mostrar "intenta más tarde"
 * - Cada código tiene una acción específica
 */
@Component({
  selector: 'app-error-handling',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <div class="container">
      <h1>🚨 Error Handling por Status Code</h1>
      <p class="subtitle">Cada status code requiere una acción diferente. NO todo es alert("Error").</p>

      <section class="demo-section">
        <h2>4xx — El cliente la cagó</h2>
        <div class="button-group">
          <button (click)="trigger400()">400 Bad Request</button>
          <button (click)="trigger401()">401 Unauthorized</button>
          <button (click)="trigger403()">403 Forbidden</button>
          <button (click)="trigger404()">404 Not Found</button>
          <button (click)="trigger422()">422 Unprocessable</button>
          <button (click)="trigger429()">429 Rate Limited</button>
        </div>
      </section>

      <section class="demo-section">
        <h2>5xx — El servidor la cagó</h2>
        <div class="button-group">
          <button (click)="trigger500()">500 Internal Error</button>
          <button (click)="trigger503()">503 Service Unavailable</button>
        </div>
      </section>

      <section class="demo-section">
        <h2>✅ Pattern correcto: Manejo por rango</h2>
        <pre class="code-box">{{ codeExample }}</pre>
      </section>

      <section class="demo-section">
        <h2>📋 Resultado</h2>
        <div class="response-box" [class.error]="isError()">
          <pre>{{ response() | json }}</pre>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .container { font-family: system-ui; }
    .subtitle { color: #666; margin-bottom: 2rem; }
    .demo-section { margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; }
    .demo-section h2 { margin-top: 0; }
    .button-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    button {
      padding: 0.6rem 1.2rem; border: none; border-radius: 6px;
      background: #dc2626; color: white; cursor: pointer; font-size: 0.85rem;
    }
    button:hover { background: #b91c1c; }
    .code-box {
      background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px;
      font-size: 0.8rem; overflow-x: auto; white-space: pre;
    }
    .response-box {
      background: #f0fdf4; padding: 1rem; border-radius: 8px; border: 1px solid #86efac;
      font-size: 0.8rem; overflow-x: auto;
    }
    .response-box.error {
      background: #fef2f2; border-color: #fca5a5;
    }
    .response-box pre { margin: 0; }
  `],
})
export class ErrorHandlingComponent {
  private readonly http = inject(HttpClient);
  readonly response = signal<unknown>(null);
  readonly isError = signal(false);

  readonly codeExample = `
// ✅ Interceptor que maneja errores por RANGO
catchError((error: HttpErrorResponse) => {
  switch (true) {
    case error.status === 401:
      // Token expirado → refresh automático
      return this.authService.refreshAndRetry(req);

    case error.status === 403:
      // Sin permisos → NO reintentar, mostrar mensaje
      this.notifyService.error('No tienes permisos');
      break;

    case error.status === 429:
      // Rate limited → esperar Retry-After
      const wait = error.headers.get('Retry-After');
      return timer(+wait * 1000).pipe(switchMap(() => next(req)));

    case error.status >= 400 && error.status < 500:
      // Error del cliente → mostrar al usuario
      this.notifyService.warn(error.error?.detail || 'Revisa los datos');
      break;

    case error.status >= 500:
      // Error del servidor → reintentar con backoff
      return this.retryWithBackoff(req, next);
  }
  return throwError(() => error);
});`;

  trigger400(): void {
    this.makeRequest('http://localhost:3000/products', 'POST', {});
  }

  trigger401(): void {
    this.setResponse({
      status: 401,
      statusText: 'Unauthorized',
      action: '🔄 El interceptor intentaría refresh token automáticamente',
      explanation: 'Token expirado o no enviado. El error interceptor maneja esto.',
    }, true);
  }

  trigger403(): void {
    this.setResponse({
      status: 403,
      statusText: 'Forbidden',
      action: '🚫 Mostrar mensaje: "No tienes permisos para esta acción"',
      explanation: 'Estás autenticado pero NO autorizado. NO reintentar.',
    }, true);
  }

  trigger404(): void {
    this.http.get('http://localhost:3000/products/99999').pipe(
      catchError((err: HttpErrorResponse) => {
        this.setResponse({
          status: err.status,
          statusText: err.statusText,
          action: '📭 Mostrar estado vacío o "Recurso no encontrado"',
          explanation: 'El recurso no existe. La UI debe manejar este caso.',
        }, true);
        return throwError(() => err);
      })
    ).subscribe();
  }

  trigger422(): void {
    this.setResponse({
      status: 422,
      statusText: 'Unprocessable Entity',
      action: '📝 Mostrar errores de validación en el formulario',
      explanation: 'El body es JSON válido pero los datos no pasan validación.',
      example_response: {
        type: 'https://api.example.com/errors/validation',
        title: 'Validation Error',
        status: 422,
        detail: 'One or more fields failed validation',
        errors: [
          { field: 'price', message: 'Must be greater than 0' },
          { field: 'name', message: 'Required field' },
        ],
      },
    }, true);
  }

  trigger429(): void {
    this.setResponse({
      status: 429,
      statusText: 'Too Many Requests',
      action: '⏳ Leer header Retry-After y esperar antes de reintentar',
      explanation: 'Has hecho demasiadas requests. El server te pide que esperes.',
      headers: { 'Retry-After': '30', 'X-RateLimit-Remaining': '0' },
    }, true);
  }

  trigger500(): void {
    this.setResponse({
      status: 500,
      statusText: 'Internal Server Error',
      action: '💥 Log del error + mensaje genérico al usuario',
      explanation: 'Bug en el servidor. NO es tu culpa. Reportar y mostrar "Intenta más tarde".',
    }, true);
  }

  trigger503(): void {
    this.setResponse({
      status: 503,
      statusText: 'Service Unavailable',
      action: '🔄 Reintentar con exponential backoff (1s, 2s, 4s...)',
      explanation: 'Servidor sobrecargado o en mantenimiento. REINTENTAR tiene sentido aquí.',
      note: 'El retry interceptor maneja esto automáticamente para GET/PUT/DELETE',
    }, true);
  }

  private makeRequest(url: string, method: string, body: unknown): void {
    const req$ = method === 'POST'
      ? this.http.post(url, body)
      : this.http.get(url);

    req$.pipe(
      catchError((err: HttpErrorResponse) => {
        this.setResponse({
          status: err.status,
          statusText: err.statusText,
          body: err.error,
        }, true);
        return throwError(() => err);
      })
    ).subscribe(res => this.setResponse(res, false));
  }

  private setResponse(data: unknown, error: boolean): void {
    this.response.set(data);
    this.isError.set(error);
  }
}
