import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Task, TaskFilters, PaginatedResponse } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3001';

  getTasks(options?: TaskFilters): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams();

    if (options?.page) {
      params = params.set('_page', options.page.toString());
    }
    if (options?.limit) {
      params = params.set('_limit', options.limit.toString());
    }
    if (options?.status) {
      params = params.set('status', options.status);
    }
    if (options?.sort) {
      const isDesc = options.sort.startsWith('-');
      const field = isDesc ? options.sort.slice(1) : options.sort;
      params = params.set('_sort', field);
      params = params.set('_order', isDesc ? 'desc' : 'asc');
    }

    return this.http
      .get<Task[]>(`${this.baseUrl}/tasks`, { params, observe: 'response' })
      .pipe(
        map((response: HttpResponse<Task[]>) => ({
          data: response.body ?? [],
          total: Number(response.headers.get('X-Total-Count') ?? 0),
        }))
      );
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/tasks/${id}`);
  }

  createTask(task: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/tasks`, task);
  }

  updateTask(id: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/tasks/${id}`, task);
  }

  patchTask(id: number, changes: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/tasks/${id}`, changes);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`);
  }

  completeTask(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/tasks/${id}`, {
      status: 'completed',
      completedAt: new Date().toISOString(),
    });
  }
}
