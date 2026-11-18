import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-config';
import { ChecklistService } from './checklist-service';

describe('ChecklistService', () => {
  let service: ChecklistService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ChecklistService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('filters checklist items by task id', () => {
    service.listByTask('1').subscribe();
    const request = http.expectOne(`${API_BASE_URL}/checklistItems?taskId=1`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('supports checklist item CRUD with string ids', () => {
    service.getById('1').subscribe();
    const getRequest = http.expectOne(`${API_BASE_URL}/checklistItems/1`);
    expect(getRequest.request.method).toBe('GET');
    getRequest.flush({});

    service.create({ taskId: 1, text: 'Step', done: false }).subscribe();
    const createRequest = http.expectOne(`${API_BASE_URL}/checklistItems`);
    expect(createRequest.request.method).toBe('POST');
    createRequest.flush({});

    service.update('1', { done: true }).subscribe();
    const updateRequest = http.expectOne(`${API_BASE_URL}/checklistItems/1`);
    expect(updateRequest.request.method).toBe('PATCH');
    updateRequest.flush({});

    service.remove('1').subscribe();
    const removeRequest = http.expectOne(`${API_BASE_URL}/checklistItems/1`);
    expect(removeRequest.request.method).toBe('DELETE');
    removeRequest.flush(null);
  });
});
