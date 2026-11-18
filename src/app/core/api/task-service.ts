import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Task } from '../../models/task.model';
import { API_BASE_URL } from './api-config';

type TaskWrite = Omit<Task, 'id'>;

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/tasks`;

  list(params = new HttpParams()): Observable<Task[]> {
    return this.http.get<Task[]>(this.url, { params });
  }

  getById(id: number | string): Observable<Task> {
    return this.http.get<Task>(`${this.url}/${id}`);
  }

  create(data: TaskWrite): Observable<Task> {
    return this.http.post<Task>(this.url, data);
  }

  update(id: number | string, data: Partial<TaskWrite>): Observable<Task> {
    return this.http.patch<Task>(`${this.url}/${id}`, data);
  }

  remove(id: number | string): Observable<void> {
    return this.http.delete<unknown>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}