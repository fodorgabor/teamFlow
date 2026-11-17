import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChecklistItem {
  id: number;
  taskId: number;
  text: string;
  done: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChecklistService {
  private apiUrl = 'http://localhost:3000/checklistItems';

  constructor(private http: HttpClient) {}

  getByTask(taskId: number | string): Observable<ChecklistItem[]> {
    return this.http.get<ChecklistItem[]>(`${this.apiUrl}?taskId=${taskId}`);
  }

  add(item: Omit<ChecklistItem, 'id'>): Observable<ChecklistItem> {
    return this.http.post<ChecklistItem>(this.apiUrl, item);
  }

  update(item: ChecklistItem): Observable<ChecklistItem> {
    return this.http.put<ChecklistItem>(`${this.apiUrl}/${item.id}`, item);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}