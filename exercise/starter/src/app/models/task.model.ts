export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  completedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'completed';
  sort?: string; // field name, prefix with - for desc (e.g. "-createdAt")
}

/**
 * RFC 7807 - Problem Details for HTTP APIs
 * https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}
