import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';

export interface Priority {
  id: number;
  name: string;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class PriorityService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/priorities';

  // Egyszer kérjük le, utána mindenki a gyorsítótárazott értéket kapja
  private readonly priorities$ = this.http
    .get<Priority[]>(this.apiUrl)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getPriorities(): Observable<Priority[]> {
    return this.priorities$;
  }

  // Alias, ha valahol még a régi név szerepel
  getAll(): Observable<Priority[]> {
    return this.getPriorities();
  }

  // Szint szerint rendezve, alapból a legmagasabb elöl
  getSorted(order: 'asc' | 'desc' = 'desc'): Observable<Priority[]> {
    return this.priorities$.pipe(
      map(list =>
        [...list].sort((a, b) =>
          order === 'asc' ? a.level - b.level : b.level - a.level
        )
      )
    );
  }

  getById(id: number): Observable<Priority | undefined> {
    return this.priorities$.pipe(
      map(list => list.find(p => p.id === id))
    );
  }

  // id -> Priority térkép, a feladatlistában a priorityId feloldásához
  getMap(): Observable<Map<number, Priority>> {
    return this.priorities$.pipe(
      map(list => new Map(list.map(p => [p.id, p] as const)))
    );
  }
}