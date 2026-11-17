import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Priority {
  id: number;
  name: string;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class PriorityService {
  private apiUrl = 'http://localhost:3000/priorities';

  constructor(private http: HttpClient) {}

  getPriorities(): Observable<Priority[]> {
    return this.http.get<Priority[]>(this.apiUrl);
  }

  // Alias, ha valahol még a régi név szerepel
  getAll(): Observable<Priority[]> {
    return this.getPriorities();
  }

  // Szint szerint rendezve, alapból a legmagasabb elöl
  getSorted(order: 'asc' | 'desc' = 'desc'): Observable<Priority[]> {
    return this.getPriorities().pipe(
      map(list =>
        [...list].sort((a, b) =>
          order === 'asc' ? a.level - b.level : b.level - a.level
        )
      )
    );
  }

  getById(id: number | string): Observable<Priority | undefined> {
    return this.getPriorities().pipe(
      map(list => list.find(p => String(p.id) === String(id)))
    );
  }

  // id (szövegként) -> Priority térkép, használat: map.get(String(task.priorityId))
  getMap(): Observable<Map<string, Priority>> {
    return this.getPriorities().pipe(
      map(list => new Map(list.map(p => [String(p.id), p] as const)))
    );
  }

  addPriority(priority: Omit<Priority, 'id'>): Observable<Priority> {
    return this.http.post<Priority>(this.apiUrl, priority);
  }

  updatePriority(priority: Priority): Observable<Priority> {
    return this.http.put<Priority>(`${this.apiUrl}/${priority.id}`, priority);
  }

  deletePriority(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}