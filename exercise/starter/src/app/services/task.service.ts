import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskFilters, PaginatedResponse } from '../models/task.model';

/**
 * 🏋️ EJERCICIO: Implementar este servicio
 *
 * Cada método debe:
 * 1. Usar el verbo HTTP correcto
 * 2. Construir query params cuando aplique
 * 3. Retornar el tipo correcto
 *
 * Pistas:
 * - json-server usa _page, _limit, _sort, _order como query params
 * - El total viene en el header X-Total-Count
 * - Para obtener headers, usa observe: 'response' en las opciones de HttpClient
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3001';

  /**
   * GET /tasks con paginación, filtrado y sorting
   * - options.page → _page query param
   * - options.limit → _limit query param
   * - options.status → status query param
   * - options.sort → _sort y _order (prefix "-" = desc)
   * - Total count viene del header X-Total-Count
   */
  getTasks(options?: TaskFilters): Observable<PaginatedResponse<Task>> {
    // TODO: Implementar
    throw new Error('Not implemented');
  }

  /**
   * GET /tasks/:id
   */
  getTask(id: number): Observable<Task> {
    // TODO: Implementar
    throw new Error('Not implemented');
  }

  /**
   * POST /tasks
   * Debe retornar el task creado (el server responde 201)
   */
  createTask(task: Omit<Task, 'id'>): Observable<Task> {
    // TODO: Implementar
    throw new Error('Not implemented');
  }

  /**
   * PUT /tasks/:id — reemplazo COMPLETO (idempotente)
   */
  updateTask(id: number, task: Task): Observable<Task> {
    // TODO: Implementar
    throw new Error('Not implemented');
  }

  /**
   * PATCH /tasks/:id — update PARCIAL
   */
  patchTask(id: number, changes: Partial<Task>): Observable<Task> {
    // TODO: Implementar
    throw new Error('Not implemented');
  }

  /**
   * DELETE /tasks/:id
   */
  deleteTask(id: number): Observable<void> {
    // TODO: Implementar
    throw new Error('Not implemented');
  }

  /**
   * Marcar tarea como completada
   * PATCH /tasks/:id con { status: 'completed', completedAt: ISO string }
   */
  completeTask(id: number): Observable<Task> {
    // TODO: Implementar
    throw new Error('Not implemented');
  }
}
