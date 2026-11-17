import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  body: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = 'http://localhost:3000/comments';

  constructor(private http: HttpClient) {}

  getCommentsByTask(taskId: number | string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}?taskId=${taskId}`);
  }

  addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, {
      ...comment,
      createdAt: new Date().toISOString(),
    });
  }

  deleteComment(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}