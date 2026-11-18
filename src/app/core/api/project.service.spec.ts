import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-config';
import { ProjectService } from './project.service';

describe("ProjectService", () => {
  let service: ProjectService;

  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProjectService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should list projects', () => {
    service.list().subscribe(result => expect(result).toEqual([]));
    const request = http.expectOne(`${API_BASE_URL}/projects`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
