import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Status } from '../../models/status.model';
import { API_BASE_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class StatusService {
  private readonly http = inject(HttpClient);
  list(): Observable<Status[]> {
    return this.http.get<Status[]>(`${API_BASE_URL}/statuses`);
  }
}