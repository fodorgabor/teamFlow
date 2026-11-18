import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User } from '../../models/user.model';
import { API_BASE_URL } from './api-config';

type UserWrite = Omit<User, 'id'>;

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/users`;

  list(params = new HttpParams()): Observable<User[]> {
    return this.http.get<User[]>(this.url, { params });
  }

  getById(id: number | string): Observable<User> {
    return this.http.get<User>(`${this.url}/${id}`);
  }

  create(data: UserWrite): Observable<User> {
    return this.http.post<User>(this.url, data);
  }

  update(id: number | string, data: Partial<UserWrite>): Observable<User> {
    return this.http.patch<User>(`${this.url}/${id}`, data);
  }

  remove(id: number | string): Observable<void> {
    return this.http.delete<unknown>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}