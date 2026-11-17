import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Status {
  id: number;
  name: string;
  key: string;
  color: string;
  order: number;
}

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private apiUrl = 'http://localhost:3000/statuses';

  constructor(private http: HttpClient) {}

  getStatuses(): Observable<Status[]> {
    return this.http.get<Status[]>(this.apiUrl);
  }
}