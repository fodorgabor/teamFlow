import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-config';
import { PriorityService } from './priority-service';

describe('PriorityService', () => {
  let service: PriorityService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PriorityService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('supports priority CRUD with string ids', () => {
    service.list().subscribe();
    const listRequest = http.expectOne(`${API_BASE_URL}/priorities`);
    expect(listRequest.request.method).toBe('GET');
    listRequest.flush([]);

    service.getById('1').subscribe();
    const getRequest = http.expectOne(`${API_BASE_URL}/priorities/1`);
    expect(getRequest.request.method).toBe('GET');
    getRequest.flush({});

    service.create({ name: 'High', level: 2 }).subscribe();
    const createRequest = http.expectOne(`${API_BASE_URL}/priorities`);
    expect(createRequest.request.method).toBe('POST');
    createRequest.flush({});

    service.update('1', { level: 3 }).subscribe();
    const updateRequest = http.expectOne(`${API_BASE_URL}/priorities/1`);
    expect(updateRequest.request.method).toBe('PATCH');
    updateRequest.flush({});

    service.remove('1').subscribe();
    const removeRequest = http.expectOne(`${API_BASE_URL}/priorities/1`);
    expect(removeRequest.request.method).toBe('DELETE');
    removeRequest.flush(null);
  });
});
