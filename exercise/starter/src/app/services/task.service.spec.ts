import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskService } from './task.service';
import { Task } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'A test task',
    status: 'pending',
    priority: 'high',
    createdAt: '2025-01-10T08:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getTasks', () => {
    it('should GET /tasks and return paginated response', () => {
      service.getTasks().subscribe(result => {
        expect(result.data).toHaveLength(2);
        expect(result.total).toBe(8);
      });

      const req = httpMock.expectOne('http://localhost:3001/tasks');
      expect(req.request.method).toBe('GET');
      req.flush([mockTask, { ...mockTask, id: 2 }], {
        headers: { 'X-Total-Count': '8' },
      });
    });

    it('should add _page and _limit params for pagination', () => {
      service.getTasks({ page: 2, limit: 5 }).subscribe();

      const req = httpMock.expectOne(
        r => r.url === 'http://localhost:3001/tasks' &&
          r.params.get('_page') === '2' &&
          r.params.get('_limit') === '5'
      );
      expect(req.request.method).toBe('GET');
      req.flush([], { headers: { 'X-Total-Count': '0' } });
    });

    it('should add status filter param', () => {
      service.getTasks({ status: 'pending' }).subscribe();

      const req = httpMock.expectOne(
        r => r.url === 'http://localhost:3001/tasks' &&
          r.params.get('status') === 'pending'
      );
      req.flush([], { headers: { 'X-Total-Count': '0' } });
    });

    it('should add _sort and _order params for ascending sort', () => {
      service.getTasks({ sort: 'createdAt' }).subscribe();

      const req = httpMock.expectOne(
        r => r.url === 'http://localhost:3001/tasks' &&
          r.params.get('_sort') === 'createdAt' &&
          r.params.get('_order') === 'asc'
      );
      req.flush([], { headers: { 'X-Total-Count': '0' } });
    });

    it('should handle descending sort (prefix -)', () => {
      service.getTasks({ sort: '-priority' }).subscribe();

      const req = httpMock.expectOne(
        r => r.url === 'http://localhost:3001/tasks' &&
          r.params.get('_sort') === 'priority' &&
          r.params.get('_order') === 'desc'
      );
      req.flush([], { headers: { 'X-Total-Count': '0' } });
    });
  });

  describe('getTask', () => {
    it('should GET /tasks/:id', () => {
      service.getTask(1).subscribe(result => {
        expect(result).toEqual(mockTask);
      });

      const req = httpMock.expectOne('http://localhost:3001/tasks/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });
  });

  describe('createTask', () => {
    it('should POST /tasks with body', () => {
      const newTask = {
        title: 'New Task',
        description: 'Description',
        status: 'pending' as const,
        priority: 'medium' as const,
        createdAt: '2025-01-20T10:00:00Z',
      };

      service.createTask(newTask).subscribe(result => {
        expect(result.id).toBe(9);
        expect(result.title).toBe('New Task');
      });

      const req = httpMock.expectOne('http://localhost:3001/tasks');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTask);
      req.flush({ id: 9, ...newTask });
    });
  });

  describe('updateTask', () => {
    it('should PUT /tasks/:id with full body', () => {
      const updatedTask: Task = { ...mockTask, title: 'Updated' };

      service.updateTask(1, updatedTask).subscribe(result => {
        expect(result.title).toBe('Updated');
      });

      const req = httpMock.expectOne('http://localhost:3001/tasks/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedTask);
      req.flush(updatedTask);
    });
  });

  describe('patchTask', () => {
    it('should PATCH /tasks/:id with partial body', () => {
      const changes = { priority: 'low' as const };

      service.patchTask(1, changes).subscribe(result => {
        expect(result.priority).toBe('low');
      });

      const req = httpMock.expectOne('http://localhost:3001/tasks/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(changes);
      req.flush({ ...mockTask, ...changes });
    });
  });

  describe('deleteTask', () => {
    it('should DELETE /tasks/:id', () => {
      service.deleteTask(1).subscribe();

      const req = httpMock.expectOne('http://localhost:3001/tasks/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('completeTask', () => {
    it('should PATCH /tasks/:id with status completed and completedAt', () => {
      service.completeTask(3).subscribe(result => {
        expect(result.status).toBe('completed');
        expect(result.completedAt).toBeDefined();
      });

      const req = httpMock.expectOne('http://localhost:3001/tasks/3');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body.status).toBe('completed');
      expect(req.request.body.completedAt).toBeDefined();
      req.flush({ ...mockTask, id: 3, status: 'completed', completedAt: '2025-01-20T12:00:00Z' });
    });
  });
});
