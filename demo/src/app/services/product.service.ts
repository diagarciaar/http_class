import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product.model';

/**
 * 🎯 DEMO: Servicio de Productos
 *
 * Demuestra cómo consumir una API REST correctamente desde Angular.
 * Cada método muestra un concepto diferente de HTTP.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000';

  /**
   * GET /products
   * Demuestra: Query params, paginación, observe response completa
   */
  getProducts(options?: {
    page?: number;
    limit?: number;
    category?: string;
    sort?: string;
  }): Observable<{ data: Product[]; total: number }> {
    let params = new HttpParams();

    if (options?.page) {
      params = params.set('_page', options.page.toString());
    }
    if (options?.limit) {
      params = params.set('_limit', options.limit.toString());
    }
    if (options?.category) {
      params = params.set('category', options.category);
    }
    if (options?.sort) {
      // json-server usa _sort y _order
      const isDesc = options.sort.startsWith('-');
      const field = isDesc ? options.sort.slice(1) : options.sort;
      params = params.set('_sort', field);
      params = params.set('_order', isDesc ? 'desc' : 'asc');
    }

    // 🎯 observe: 'response' nos da acceso a HEADERS (no solo el body)
    // json-server devuelve X-Total-Count en headers para paginación
    return this.http
      .get<Product[]>(`${this.baseUrl}/products`, {
        params,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<Product[]>) => ({
          data: response.body ?? [],
          total: Number(response.headers.get('X-Total-Count') ?? 0),
        }))
      );
  }

  /**
   * GET /products/:id
   * Demuestra: Path params, manejo de 404
   */
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }

  /**
   * POST /products
   * Demuestra: Body en request, Content-Type automático, 201 Created
   */
  createProduct(product: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, product);
  }

  /**
   * PUT /products/:id
   * Demuestra: Reemplazo COMPLETO del recurso (idempotente)
   * Si lo llamas 10 veces con el mismo body, resultado es el mismo
   */
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, product);
  }

  /**
   * PATCH /products/:id
   * Demuestra: Update PARCIAL — solo envías lo que cambió
   */
  patchProduct(id: number, changes: Partial<Product>): Observable<Product> {
    return this.http.patch<Product>(`${this.baseUrl}/products/${id}`, changes);
  }

  /**
   * DELETE /products/:id
   * Demuestra: 200/204 en éxito, idempotente (borrar algo ya borrado = ok)
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }
}
