export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * RFC 7807 - Problem Details for HTTP APIs
 * Este es el estándar para respuestas de error en APIs REST.
 * https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}

export interface Order {
  id: number;
  productId: number;
  quantity: number;
  status: 'pending' | 'shipped' | 'completed';
  createdAt: string;
}
