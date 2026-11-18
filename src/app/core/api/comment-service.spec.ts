import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-config';
import { CommentService } from './comment-service';

describe('CommentService', () => {
  let service: CommentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CommentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('filters comments by task id', () => {
    service.listByTask('1').subscribe();
    const request = http.expectOne(`${API_BASE_URL}/comments?taskId=1`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates comments with a timestamp and supports update and remove', () => {
    service.create({ taskId: 1, userId: 2, body: 'Hello' }).subscribe();
    const createRequest = http.expectOne(`${API_BASE_URL}/comments`);
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.body.createdAt).toEqual(expect.any(String));
    createRequest.flush({});

    service.update('1', { body: 'Updated' }).subscribe();
    const updateRequest = http.expectOne(`${API_BASE_URL}/comments/1`);
    expect(updateRequest.request.method).toBe('PATCH');
    updateRequest.flush({});

    service.remove('1').subscribe();
    const removeRequest = http.expectOne(`${API_BASE_URL}/comments/1`);
    expect(removeRequest.request.method).toBe('DELETE');
    removeRequest.flush(null);
  });
});
