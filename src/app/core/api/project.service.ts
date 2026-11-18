import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Project } from '../../models/project.model';
import { API_BASE_URL } from './api-config';

type ProjectWrite = Omit<Project, 'id'>;

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE_URL}/projects`;

  list(params = new HttpParams()): Observable<Project[]> {
    return this.http.get<Project[]>(this.url, { params });
  }

  getById(id: number | string): Observable<Project> {
    return this.http.get<Project>(`${this.url}/${id}`);
  }

  create(data: ProjectWrite): Observable<Project> {
    return this.http.post<Project>(this.url, data);
  }

  update(id: number | string, data: Partial<ProjectWrite>): Observable<Project> {
    return this.http.patch<Project>(`${this.url}/${id}`, data);
  }

  remove(id: number | string): Observable<void> {
    return this.http.delete<unknown>(`${this.url}/${id}`)
      .pipe(map(() => void 0));
  }
}