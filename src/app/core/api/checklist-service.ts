import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ChecklistItem } from '../../models/checklist-item.model';
import { API_BASE_URL } from './api-config';

type ChecklistItemWrite = Omit<ChecklistItem, 'id'>;

@Injectable({ providedIn: 'root' })
export class ChecklistService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/checklistItems`;

  list(params = new HttpParams()): Observable<ChecklistItem[]> {
    return this.http.get<ChecklistItem[]>(this.url, { params });
  }

  listByTask(taskId: number | string): Observable<ChecklistItem[]> {
    return this.list(new HttpParams().set('taskId', taskId));
  }

  getById(id: number | string): Observable<ChecklistItem> {
    return this.http.get<ChecklistItem>(`${this.url}/${id}`);
  }

  create(data: ChecklistItemWrite): Observable<ChecklistItem> {
    return this.http.post<ChecklistItem>(this.url, data);
  }

  update(id: number | string, data: Partial<ChecklistItemWrite>): Observable<ChecklistItem> {
    return this.http.patch<ChecklistItem>(`${this.url}/${id}`, data);
  }

  remove(id: number | string): Observable<void> {
    return this.http.delete<unknown>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}
