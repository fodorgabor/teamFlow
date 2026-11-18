import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-config';
import { TimeEntryService } from './time-entry-service';

describe('TimeEntryService', () => {
  let service: TimeEntryService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TimeEntryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('filters time entries by task id', () => {
    service.listByTask('1').subscribe();
    const request = http.expectOne(`${API_BASE_URL}/timeEntries?taskId=1`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('supports time entry CRUD with string ids', () => {
    service.getById('1').subscribe();
    const getRequest = http.expectOne(`${API_BASE_URL}/timeEntries/1`);
    expect(getRequest.request.method).toBe('GET');
    getRequest.flush({});

    const data = { taskId: 1, userId: 1, minutes: 30, date: '2026-01-01', note: '' };
    service.create(data).subscribe();
    const createRequest = http.expectOne(`${API_BASE_URL}/timeEntries`);
    expect(createRequest.request.method).toBe('POST');
    createRequest.flush({});

    service.update('1', { minutes: 45 }).subscribe();
    const updateRequest = http.expectOne(`${API_BASE_URL}/timeEntries/1`);
    expect(updateRequest.request.method).toBe('PATCH');
    updateRequest.flush({});

    service.remove('1').subscribe();
    const removeRequest = http.expectOne(`${API_BASE_URL}/timeEntries/1`);
    expect(removeRequest.request.method).toBe('DELETE');
    removeRequest.flush(null);
  });
});
