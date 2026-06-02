import { Component, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

/**
 * 🎯 DEMO: Página principal de ejemplos
 *
 * Cada botón dispara un tipo diferente de request HTTP.
 * Los asistentes ven en DevTools Network tab qué pasa en cada caso.
 */
@Component({
  selector: 'app-examples',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <div class="container">
      <h1>🌐 HTTP Methods Demo</h1>
      <p class="subtitle">Abre DevTools → Network tab para ver cada request</p>

      <section class="demo-section">
        <h2>GET — Leer recursos</h2>
        <div class="button-group">
          <button (click)="getAll()">GET /products</button>
          <button (click)="getWithPagination()">GET /products?_page=1&_limit=3</button>
          <button (click)="getWithFilter()">GET /products?category=peripherals</button>
          <button (click)="getOne()">GET /products/1</button>
          <button (click)="getNotFound()" class="btn-warning">GET /products/999 (404)</button>
        </div>
      </section>

      <section class="demo-section">
        <h2>POST — Crear recursos</h2>
        <div class="button-group">
          <button (click)="createProduct()">POST /products (201 Created)</button>
          <button (click)="createProductTwice()" class="btn-warning">
            POST x2 (NO idempotente — crea duplicados!)
          </button>
        </div>
      </section>

      <section class="demo-section">
        <h2>PUT vs PATCH — Actualizar recursos</h2>
        <div class="button-group">
          <button (click)="putProduct()">PUT /products/1 (reemplazo completo)</button>
          <button (click)="patchProduct()">PATCH /products/1 (solo precio)</button>
          <button (click)="putIdempotent()" class="btn-success">
            PUT x3 (idempotente — mismo resultado)
          </button>
        </div>
      </section>

      <section class="demo-section">
        <h2>DELETE — Eliminar recursos</h2>
        <div class="button-group">
          <button (click)="deleteProduct()">DELETE /products/10</button>
        </div>
      </section>

      <section class="demo-section">
        <h2>📋 Response</h2>
        <pre class="response-box">{{ response() | json }}</pre>
      </section>
    </div>
  `,
  styles: [`
    .container { max-width: 900px; margin: 0 auto; padding: 2rem; font-family: system-ui; }
    .subtitle { color: #666; margin-bottom: 2rem; }
    .demo-section { margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; }
    .demo-section h2 { margin-top: 0; color: #333; }
    .button-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    button {
      padding: 0.6rem 1.2rem; border: none; border-radius: 6px;
      background: #4f46e5; color: white; cursor: pointer; font-size: 0.85rem;
      transition: background 0.2s;
    }
    button:hover { background: #4338ca; }
    .btn-warning { background: #f59e0b; }
    .btn-warning:hover { background: #d97706; }
    .btn-success { background: #10b981; }
    .btn-success:hover { background: #059669; }
    .response-box {
      background: #1e1e2e; color: #a6e3a1; padding: 1rem; border-radius: 8px;
      overflow-x: auto; font-size: 0.8rem; max-height: 400px; overflow-y: auto;
    }
  `],
})
export class ExamplesComponent {
  private readonly productService = inject(ProductService);
  readonly response = signal<unknown>(null);

  getAll(): void {
    this.productService.getProducts().subscribe(res => this.response.set(res));
  }

  getWithPagination(): void {
    this.productService
      .getProducts({ page: 1, limit: 3 })
      .subscribe(res => this.response.set(res));
  }

  getWithFilter(): void {
    this.productService
      .getProducts({ category: 'peripherals' })
      .subscribe(res => this.response.set(res));
  }

  getOne(): void {
    this.productService.getProduct(1).subscribe(res => this.response.set(res));
  }

  getNotFound(): void {
    this.productService.getProduct(999).subscribe({
      next: res => this.response.set(res),
      error: err => this.response.set({
        status: err.status,
        statusText: err.statusText,
        message: '⚠️ Este producto NO existe — el server responde 404',
      }),
    });
  }

  createProduct(): void {
    this.productService
      .createProduct({
        name: 'New Widget ' + Date.now(),
        price: 29.99,
        category: 'accessories',
        stock: 10,
      })
      .subscribe(res => this.response.set({
        created: res,
        note: '✅ Status 201 Created — revisa el Location header en Network tab',
      }));
  }

  createProductTwice(): void {
    const product = { name: 'Duplicate Item', price: 9.99, category: 'accessories', stock: 5 };
    this.productService.createProduct(product).subscribe();
    this.productService.createProduct(product).subscribe(res =>
      this.response.set({
        result: res,
        warning: '⚠️ POST NO es idempotente — se crearon DOS recursos con el mismo contenido!',
      })
    );
  }

  putProduct(): void {
    const fullProduct: Product = {
      id: 1,
      name: 'Updated Keyboard',
      price: 159.99,
      category: 'peripherals',
      stock: 20,
    };
    this.productService.updateProduct(1, fullProduct).subscribe(res =>
      this.response.set({
        result: res,
        note: '✅ PUT reemplaza TODO el recurso. Si omites un campo, se pierde.',
      })
    );
  }

  patchProduct(): void {
    this.productService.patchProduct(1, { price: 139.99 }).subscribe(res =>
      this.response.set({
        result: res,
        note: '✅ PATCH solo actualiza los campos enviados. El resto queda igual.',
      })
    );
  }

  putIdempotent(): void {
    const fullProduct: Product = {
      id: 1,
      name: 'Idempotent Keyboard',
      price: 149.99,
      category: 'peripherals',
      stock: 25,
    };
    // Llamar PUT 3 veces — el resultado es SIEMPRE el mismo
    this.productService.updateProduct(1, fullProduct).subscribe();
    this.productService.updateProduct(1, fullProduct).subscribe();
    this.productService.updateProduct(1, fullProduct).subscribe(res =>
      this.response.set({
        result: res,
        note: '✅ PUT es IDEMPOTENTE — 3 calls, mismo resultado. Safe para retry.',
      })
    );
  }

  deleteProduct(): void {
    this.productService.deleteProduct(10).subscribe({
      next: () => this.response.set({
        note: '✅ DELETE exitoso — Status 200/204. El recurso ya no existe.',
      }),
      error: err => this.response.set({ status: err.status, message: 'Error al eliminar' }),
    });
  }
}
