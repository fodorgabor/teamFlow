import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-config';
import { StatusService } from './status-service';

describe('StatusService', () => {
  let service: StatusService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StatusService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('supports the status CRUD endpoints with string ids', () => {
    service.list().subscribe();
    const listRequest = http.expectOne(`${API_BASE_URL}/statuses`);
    expect(listRequest.request.method).toBe('GET');
    listRequest.flush([]);

    service.getById('1').subscribe();
    const getRequest = http.expectOne(`${API_BASE_URL}/statuses/1`);
    expect(getRequest.request.method).toBe('GET');
    getRequest.flush({});

    service.create({ name: 'Done', key: 'done', color: '#000000', order: 1 }).subscribe();
    const createRequest = http.expectOne(`${API_BASE_URL}/statuses`);
    expect(createRequest.request.method).toBe('POST');
    createRequest.flush({});

    service.update('1', { name: 'Complete' }).subscribe();
    const updateRequest = http.expectOne(`${API_BASE_URL}/statuses/1`);
    expect(updateRequest.request.method).toBe('PATCH');
    updateRequest.flush({});

    service.remove('1').subscribe();
    const removeRequest = http.expectOne(`${API_BASE_URL}/statuses/1`);
    expect(removeRequest.request.method).toBe('DELETE');
    removeRequest.flush(null);
  });
});
