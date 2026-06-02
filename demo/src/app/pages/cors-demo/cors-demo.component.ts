import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { JsonPipe } from '@angular/common';
import { catchError, throwError } from 'rxjs';

/**
 * 🎯 DEMO: CORS — El error que todos googlean
 *
 * CORS no es un bug, es SEGURIDAD del browser.
 * El browser bloquea requests cross-origin a menos que el server lo permita.
 *
 * Puntos clave:
 * - Same-Origin Policy: browser solo permite requests al MISMO origen
 * - CORS headers: el SERVER dice "acepto requests de este origen"
 * - Preflight (OPTIONS): el browser pregunta ANTES de enviar la request real
 * - El error de CORS NO se ve en el response — el browser lo bloquea antes
 */
@Component({
  selector: 'app-cors-demo',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <div class="container">
      <h1>🔒 CORS — Cross-Origin Resource Sharing</h1>
      <p class="subtitle">No es un bug. Es seguridad del browser. El SERVER decide quién puede acceder.</p>

      <section class="demo-section">
        <h2>¿Qué es Same-Origin?</h2>
        <div class="origin-table">
          <div class="origin-row header">
            <span>URL</span>
            <span>Same Origin que http://localhost:4200?</span>
          </div>
          <div class="origin-row ok">
            <span>http://localhost:4200/api/products</span>
            <span>✅ Sí — mismo protocolo, host, puerto</span>
          </div>
          <div class="origin-row fail">
            <span>http://localhost:3000/products</span>
            <span>❌ No — puerto diferente (3000 vs 4200)</span>
          </div>
          <div class="origin-row fail">
            <span>https://api.github.com/users</span>
            <span>❌ No — host diferente</span>
          </div>
          <div class="origin-row fail">
            <span>https://localhost:4200/api</span>
            <span>❌ No — protocolo diferente (https vs http)</span>
          </div>
        </div>
      </section>

      <section class="demo-section">
        <h2>Probar CORS</h2>
        <div class="button-group">
          <button class="btn-success" (click)="sameOriginRequest()">
            ✅ Same Origin (localhost:3000 con CORS habilitado)
          </button>
          <button class="btn-danger" (click)="crossOriginNoCors()">
            ❌ Cross-Origin sin CORS (API externa)
          </button>
          <button class="btn-info" (click)="crossOriginWithCors()">
            ✅ Cross-Origin CON CORS (API pública)
          </button>
        </div>
      </section>

      <section class="demo-section">
        <h2>Simple Request vs Preflight</h2>
        <div class="comparison">
          <div class="comparison-col">
            <h3>Simple Request (sin preflight)</h3>
            <ul>
              <li>GET, HEAD, POST</li>
              <li>Solo headers "safe": Accept, Content-Type (form/text/multipart)</li>
              <li>No custom headers</li>
            </ul>
          </div>
          <div class="comparison-col">
            <h3>Preflight (OPTIONS primero)</h3>
            <ul>
              <li>PUT, PATCH, DELETE</li>
              <li>Content-Type: application/json</li>
              <li>Custom headers (Authorization, X-Custom)</li>
              <li>El browser envía OPTIONS ANTES de tu request</li>
            </ul>
          </div>
        </div>
        <button (click)="triggerPreflight()">🔍 Disparar Preflight (PUT con JSON)</button>
      </section>

      <section class="demo-section">
        <h2>Headers CORS que el SERVER debe enviar</h2>
        <pre class="code-box">{{ corsHeaders }}</pre>
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
      background: #4f46e5; color: white; cursor: pointer; font-size: 0.85rem;
    }
    .btn-success { background: #10b981; }
    .btn-danger { background: #dc2626; }
    .btn-info { background: #0ea5e9; }
    .origin-table { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .origin-row {
      display: grid; grid-template-columns: 1fr 1fr; padding: 0.6rem 1rem;
      font-size: 0.85rem; border-bottom: 1px solid #e0e0e0;
    }
    .origin-row:last-child { border-bottom: none; }
    .origin-row.header { background: #f3f4f6; font-weight: 600; }
    .origin-row.ok { background: #f0fdf4; }
    .origin-row.fail { background: #fef2f2; }
    .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
    .comparison-col { padding: 1rem; background: #f8fafc; border-radius: 8px; }
    .comparison-col h3 { margin-top: 0; font-size: 0.9rem; }
    .comparison-col ul { font-size: 0.85rem; padding-left: 1.2rem; }
    .code-box {
      background: #1e1e2e; color: #cdd6f4; padding: 1rem; border-radius: 8px;
      font-size: 0.8rem; overflow-x: auto; white-space: pre;
    }
    .response-box {
      background: #f0fdf4; padding: 1rem; border-radius: 8px; border: 1px solid #86efac;
      font-size: 0.8rem; overflow-x: auto;
    }
    .response-box.error { background: #fef2f2; border-color: #fca5a5; }
    .response-box pre { margin: 0; }
  `],
})
export class CorsDemoComponent {
  private readonly http = inject(HttpClient);
  readonly response = signal<unknown>(null);
  readonly isError = signal(false);

  readonly corsHeaders = `// Headers que el SERVER debe incluir en la response:
Access-Control-Allow-Origin: http://localhost:4200   // o * para cualquiera
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400                        // Cache del preflight (24h)

// json-server ya incluye estos headers por defecto.
// En producción, tu backend DEBE configurarlos explícitamente.`;

  sameOriginRequest(): void {
    this.http.get('http://localhost:3000/products').pipe(
      catchError((err: HttpErrorResponse) => {
        this.setResponse({ error: 'Request falló', status: err.status }, true);
        return throwError(() => err);
      })
    ).subscribe(res => {
      this.setResponse({
        success: true,
        note: '✅ json-server en localhost:3000 tiene CORS habilitado por defecto',
        explanation: 'Aunque el puerto es diferente (4200 vs 3000), json-server envía Access-Control-Allow-Origin: *',
        data: res,
      }, false);
    });
  }

  crossOriginNoCors(): void {
    // Intentar llamar una API que NO tiene CORS habilitado
    this.http.get('https://www.google.com').pipe(
      catchError((err: HttpErrorResponse) => {
        this.setResponse({
          error: '❌ CORS Error',
          status: err.status,
          explanation: 'El browser BLOQUEÓ la request porque google.com NO envía Access-Control-Allow-Origin',
          whatYouSee: 'En Network tab verás status 0 o "(failed)" — el browser ni siquiera te muestra la response',
          solution: 'El SERVER debe agregar los headers CORS. Tú como frontend NO puedes "arreglar" CORS.',
          wrongSolutions: [
            '❌ mode: "no-cors" — te da una opaque response, no puedes leer el body',
            '❌ Proxy en dev — solo funciona en desarrollo, no en producción',
            '❌ Extensiones de browser — solo para ti, no para tus usuarios',
          ],
        }, true);
        return throwError(() => err);
      })
    ).subscribe();
  }

  crossOriginWithCors(): void {
    // API pública que SÍ tiene CORS habilitado
    this.http.get('https://jsonplaceholder.typicode.com/posts/1').pipe(
      catchError((err: HttpErrorResponse) => {
        this.setResponse({ error: 'Request falló', status: err.status }, true);
        return throwError(() => err);
      })
    ).subscribe(res => {
      this.setResponse({
        success: true,
        note: '✅ jsonplaceholder.typicode.com tiene CORS habilitado (Access-Control-Allow-Origin: *)',
        explanation: 'APIs públicas DEBEN habilitar CORS para que browsers puedan consumirlas',
        data: res,
      }, false);
    });
  }

  triggerPreflight(): void {
    // PUT con Content-Type: application/json dispara preflight
    this.http.put('http://localhost:3000/products/1', {
      id: 1,
      name: 'Preflight Test',
      price: 99.99,
      category: 'test',
      stock: 1,
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        this.setResponse({ error: 'Preflight o request falló', status: err.status }, true);
        return throwError(() => err);
      })
    ).subscribe(res => {
      this.setResponse({
        success: true,
        note: '🔍 Revisa Network tab — verás DOS requests:',
        requests: [
          '1. OPTIONS /products/1 (preflight) — el browser pregunta "¿puedo hacer PUT con JSON?"',
          '2. PUT /products/1 (la request real) — solo se envía si el preflight responde OK',
        ],
        explanation: 'PUT + Content-Type: application/json = NO es "simple request" → preflight obligatorio',
        data: res,
      }, false);
    });
  }

  private setResponse(data: unknown, error: boolean): void {
    this.response.set(data);
    this.isError.set(error);
  }
}
