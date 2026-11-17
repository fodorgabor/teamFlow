import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TimeEntry {
  id: number;
  taskId: number;
  userId: number;
  minutes: number;
  date: string;
  note: string;
}

@Injectable({
  providedIn: 'root',
})
export class TimeEntryService {
  private apiUrl = 'http://localhost:3000/timeEntries';

  constructor(private http: HttpClient) {}

  getAll(): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(this.apiUrl);
  }

  getByTask(taskId: number | string): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(`${this.apiUrl}?taskId=${taskId}`);
  }

  add(entry: Omit<TimeEntry, 'id'>): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(this.apiUrl, entry);
  }
}