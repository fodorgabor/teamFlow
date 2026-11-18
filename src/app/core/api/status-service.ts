import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Status } from '../../models/status.model';
import { API_BASE_URL } from './api-config';

type StatusWrite = Omit<Status, 'id'>;

@Injectable({ providedIn: 'root' })
export class StatusService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/statuses`;

  list(): Observable<Status[]> {
    return this.http.get<Status[]>(this.url);
  }

  getById(id: number | string): Observable<Status> {
    return this.http.get<Status>(`${this.url}/${id}`);
  }

  create(data: StatusWrite): Observable<Status> {
    return this.http.post<Status>(this.url, data);
  }

  update(id: number | string, data: Partial<StatusWrite>): Observable<Status> {
    return this.http.patch<Status>(`${this.url}/${id}`, data);
  }

  remove(id: number | string): Observable<void> {
    return this.http.delete<unknown>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}