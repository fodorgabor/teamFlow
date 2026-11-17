import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeEntry } from '../../models/time-entry.model';
import { API_BASE_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class TimeEntryService {
  private readonly http = inject(HttpClient);

  list(): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(`${API_BASE_URL}/timeEntries`);
  }
}
