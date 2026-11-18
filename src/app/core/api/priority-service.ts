import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Priority } from '../../models/priority.model';
import { API_BASE_URL } from './api-config';

type PriorityWrite = Omit<Priority, 'id'>;

@Injectable({ providedIn: 'root' })
export class PriorityService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/priorities`;

  list(): Observable<Priority[]> {
    return this.http.get<Priority[]>(this.url);
  }

  getById(id: number | string): Observable<Priority> {
    return this.http.get<Priority>(`${this.url}/${id}`);
  }

  create(data: PriorityWrite): Observable<Priority> {
    return this.http.post<Priority>(this.url, data);
  }

  update(id: number | string, data: Partial<PriorityWrite>): Observable<Priority> {
    return this.http.patch<Priority>(`${this.url}/${id}`, data);
  }

  remove(id: number | string): Observable<void> {
    return this.http.delete<unknown>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }

  getSorted(order: 'asc' | 'desc' = 'desc'): Observable<Priority[]> {
    return this.list().pipe(
      map(list =>
        [...list].sort((a, b) =>
          order === 'asc' ? a.level - b.level : b.level - a.level
        )
      )
    );
  }

  getMap(): Observable<Map<string, Priority>> {
    return this.list().pipe(
      map(list => new Map(list.map(priority => [String(priority.id), priority] as const)))
    );
  }
}
