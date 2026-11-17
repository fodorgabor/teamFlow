import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';

export interface Label {
  id: number;
  name: string;
  color: string;
}

@Injectable({
  providedIn: 'root',
})
export class LabelService {
  private apiUrl = 'http://localhost:3000/labels';

  constructor(private http: HttpClient) {}

  getLabels(): Observable<Label[]> {
    return this.http.get<Label[]>(this.apiUrl);
  }

  addLabel(label: Omit<Label, 'id'>): Observable<Label> {
    return this.http.post<Label>(this.apiUrl, label);
  }

  updateLabel(label: Label): Observable<Label> {
    return this.http.put<Label>(`${this.apiUrl}/${label.id}`, label);
  }

  deleteLabel(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}