import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ProjectMember } from '../../models/projectMember.model';
import { API_BASE_URL } from './api-config';

type ProjectMemberWrite = Omit<ProjectMember, 'id'>;

@Injectable({ providedIn: 'root' })
export class ProjectMemberService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/projectMembers`;

  list(params = new HttpParams()): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(this.url, { params });
  }

  getById(id: number | string): Observable<ProjectMember> {
    return this.http.get<ProjectMember>(`${this.url}/${id}`);
  }

  create(data: ProjectMemberWrite): Observable<ProjectMember> {
    return this.http.post<ProjectMember>(this.url, data);
  }

  update(id: number | string, data: Partial<ProjectMemberWrite>): Observable<ProjectMember> {
    return this.http.patch<ProjectMember>(`${this.url}/${id}`, data);
  }

  remove(id: number | string): Observable<void> {
    return this.http.delete<unknown>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}