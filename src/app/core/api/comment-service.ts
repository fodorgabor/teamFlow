import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Comment } from '../../models/comment.model';
import { API_BASE_URL } from './api-config';

type CommentWrite = Omit<Comment, 'id' | 'createdAt'>;

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/comments`;

  list(params = new HttpParams()): Observable<Comment[]> {
    return this.http.get<Comment[]>(this.url, { params });
  }

  listByTask(taskId: number | string): Observable<Comment[]> {
    return this.list(new HttpParams().set('taskId', taskId));
  }

  getById(id: number | string): Observable<Comment> {
    return this.http.get<Comment>(`${this.url}/${id}`);
  }

  create(data: CommentWrite): Observable<Comment> {
    return this.http.post<Comment>(this.url, {
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  update(id: number | string, data: Partial<CommentWrite>): Observable<Comment> {
    return this.http.patch<Comment>(`${this.url}/${id}`, data);
  }

  remove(id: number | string): Observable<void> {
    return this.http.delete<unknown>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}
