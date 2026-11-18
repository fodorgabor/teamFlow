import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-config';
import { LabelService } from './label-service';

describe('LabelService', () => {
  let service: LabelService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LabelService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('supports label CRUD with string ids', () => {
    service.list().subscribe();
    const listRequest = http.expectOne(`${API_BASE_URL}/labels`);
    expect(listRequest.request.method).toBe('GET');
    listRequest.flush([]);

    service.getById('1').subscribe();
    const getRequest = http.expectOne(`${API_BASE_URL}/labels/1`);
    expect(getRequest.request.method).toBe('GET');
    getRequest.flush({});

    service.create({ name: 'Feature', color: '#000000' }).subscribe();
    const createRequest = http.expectOne(`${API_BASE_URL}/labels`);
    expect(createRequest.request.method).toBe('POST');
    createRequest.flush({});

    service.update('1', { name: 'Updated' }).subscribe();
    const updateRequest = http.expectOne(`${API_BASE_URL}/labels/1`);
    expect(updateRequest.request.method).toBe('PATCH');
    updateRequest.flush({});

    service.remove('1').subscribe();
    const removeRequest = http.expectOne(`${API_BASE_URL}/labels/1`);
    expect(removeRequest.request.method).toBe('DELETE');
    removeRequest.flush(null);
  });
});
