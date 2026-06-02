import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { retryInterceptor } from './retry.interceptor';

describe('retryInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([retryInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should NOT retry POST requests', () => {
    let errorReceived = false;

    http.post('/api/tasks', { title: 'test' }).subscribe({
      error: () => { errorReceived = true; },
    });

    const req = httpMock.expectOne('/api/tasks');
    req.flush('Service Unavailable', { status: 503, statusText: 'Service Unavailable' });

    // Should NOT retry — only 1 request total
    httpMock.expectNone('/api/tasks');
    expect(errorReceived).toBe(true);
  });

  it('should NOT retry on 4xx errors', () => {
    let errorReceived = false;

    http.get('/api/tasks/999').subscribe({
      error: () => { errorReceived = true; },
    });

    const req = httpMock.expectOne('/api/tasks/999');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    httpMock.expectNone('/api/tasks/999');
    expect(errorReceived).toBe(true);
  });

  it('should retry GET on 503 with exponential backoff', fakeAsync(() => {
    let result: unknown = null;

    http.get('/api/tasks').subscribe(res => { result = res; });

    // First attempt — fails with 503
    const req1 = httpMock.expectOne('/api/tasks');
    req1.flush('Unavailable', { status: 503, statusText: 'Service Unavailable' });

    // Wait for first backoff (1000ms)
    tick(1000);

    // Second attempt — succeeds
    const req2 = httpMock.expectOne('/api/tasks');
    req2.flush([{ id: 1, title: 'Task' }]);

    expect(result).toEqual([{ id: 1, title: 'Task' }]);
  }));

  it('should retry PUT requests (idempotent)', fakeAsync(() => {
    let result: unknown = null;

    http.put('/api/tasks/1', { title: 'updated' }).subscribe(res => { result = res; });

    const req1 = httpMock.expectOne('/api/tasks/1');
    req1.flush('Unavailable', { status: 503, statusText: 'Service Unavailable' });

    tick(1000);

    const req2 = httpMock.expectOne('/api/tasks/1');
    req2.flush({ id: 1, title: 'updated' });

    expect(result).toEqual({ id: 1, title: 'updated' });
  }));

  it('should retry DELETE requests (idempotent)', fakeAsync(() => {
    let completed = false;

    http.delete('/api/tasks/1').subscribe(() => { completed = true; });

    const req1 = httpMock.expectOne('/api/tasks/1');
    req1.flush('Unavailable', { status: 503, statusText: 'Service Unavailable' });

    tick(1000);

    const req2 = httpMock.expectOne('/api/tasks/1');
    req2.flush(null);

    expect(completed).toBe(true);
  }));

  it('should give up after 3 retries', fakeAsync(() => {
    let errorReceived = false;

    http.get('/api/tasks').subscribe({
      error: () => { errorReceived = true; },
    });

    // Attempt 1
    httpMock.expectOne('/api/tasks').flush('', { status: 503, statusText: '' });
    tick(1000);

    // Retry 1
    httpMock.expectOne('/api/tasks').flush('', { status: 503, statusText: '' });
    tick(2000);

    // Retry 2
    httpMock.expectOne('/api/tasks').flush('', { status: 503, statusText: '' });
    tick(4000);

    // Retry 3
    httpMock.expectOne('/api/tasks').flush('', { status: 503, statusText: '' });

    // No more retries
    httpMock.expectNone('/api/tasks');
    expect(errorReceived).toBe(true);
  }));
});
