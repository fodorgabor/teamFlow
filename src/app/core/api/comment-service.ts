import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../../models/comment.model';
import { API_BASE_URL } from './api-config';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private readonly http = inject(HttpClient);

  list(): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${API_BASE_URL}/comments`);
  }
}
