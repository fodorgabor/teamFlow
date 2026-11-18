import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Label } from '../../models/label.model';
import { API_BASE_URL } from './api-config';

type LabelWrite = Omit<Label, 'id'>;

@Injectable({ providedIn: 'root' })
export class LabelService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/labels`;

  list(): Observable<Label[]> {
    return this.http.get<Label[]>(this.url);
  }

  getById(id: number | string): Observable<Label> {
    return this.http.get<Label>(`${this.url}/${id}`);
  }

  create(data: LabelWrite): Observable<Label> {
    return this.http.post<Label>(this.url, data);
  }

  update(id: number | string, data: Partial<LabelWrite>): Observable<Label> {
    return this.http.patch<Label>(`${this.url}/${id}`, data);
  }

  remove(id: number | string): Observable<void> {
    return this.http.delete<unknown>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}
