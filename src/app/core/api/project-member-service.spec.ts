import { provideHttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-config';
import { ProjectMemberService } from './project-member-service';

describe("ProjectMemberService", () => {
  let service: ProjectMemberService;

  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProjectMemberService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists project members by project id', () => {
    service.list(new HttpParams().set('projectId', '1')).subscribe();
    const request = http.expectOne(`${API_BASE_URL}/projectMembers?projectId=1`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
