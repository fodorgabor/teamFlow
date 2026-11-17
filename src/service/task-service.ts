import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  assigneeId: number;
  statusId: number;
  priorityId: number;
  dueDate: string;
  estimateHours: number;
  labelIds: number[];
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) {}

  // Összes feladat lekérése
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  // Egy feladat lekérése azonosító alapján (szám vagy szöveg ID)
  getTask(id: number | string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  // Új feladat létrehozása
  addTask(task: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  // Feladat módosítása
  updateTask(task: Task): Observable<Task> {
    return this.http.put<Task>(
      `${this.apiUrl}/${task.id}`,
      task
    );
  }

  // Feladat törlése
  deleteTask(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}