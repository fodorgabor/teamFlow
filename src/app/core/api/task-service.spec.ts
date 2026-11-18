import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from './api-config';
import { TaskService } from './task-service';

describe('TaskService', () => {
  let service: TaskService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists tasks and gets a task with a string id', () => {
    service.list().subscribe();
    const listRequest = http.expectOne(`${API_BASE_URL}/tasks`);
    expect(listRequest.request.method).toBe('GET');
    listRequest.flush([]);

    service.getById('1').subscribe();
    const getRequest = http.expectOne(`${API_BASE_URL}/tasks/1`);
    expect(getRequest.request.method).toBe('GET');
    getRequest.flush({});
  });

  it('creates, updates, and removes tasks', () => {
    const data = {
      projectId: 1,
      title: 'Task',
      description: '',
      assigneeId: 1,
      statusId: 1,
      priorityId: 1,
      dueDate: '',
      estimateHours: 1,
      labelIds: [],
    };
    service.create(data).subscribe();
    const createRequest = http.expectOne(`${API_BASE_URL}/tasks`);
    expect(createRequest.request.method).toBe('POST');
    createRequest.flush({});

    service.update('1', { title: 'Updated' }).subscribe();
    const updateRequest = http.expectOne(`${API_BASE_URL}/tasks/1`);
    expect(updateRequest.request.method).toBe('PATCH');
    updateRequest.flush({});

    service.remove('1').subscribe(result => expect(result).toBeUndefined());
    const removeRequest = http.expectOne(`${API_BASE_URL}/tasks/1`);
    expect(removeRequest.request.method).toBe('DELETE');
    removeRequest.flush(null);
  });
});
