import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { TaskService } from '../../service/task-service';
import { StatusService, Status } from '../../service/status-service';
import { PriorityService, Priority } from '../../service/priority-service';
import { UserService, User } from '../../service/user-service';
import { ProjectsService, Project } from '../../service/projects-service';

// Szám marad, ha az ID szám, különben szövegként megy tovább
const asId = (v: number | string): number =>
  (Number.isNaN(Number(v)) ? v : Number(v)) as number;

@Component({
  selector: 'app-uj-feladat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './uj-feladat.html',
  styleUrl: './uj-feladat.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UjFeladat implements OnInit {
  // Űrlap mezők
  title = '';
  description = '';
  projectId: number | null = null;
  assigneeId: number | null = null;
  statusId = 1; // Alapértelmezett: Tervezett
  priorityId = 2; // Alapértelmezett: Normál
  dueDate = '';
  estimateHours = 1;
  selectedLabelIds: number[] = [];

  // Lookup adatok
  statuses: Status[] = [];
  priorities: Priority[] = [];
  users: User[] = [];
  projects: Project[] = [];
  labels: { id: number; name: string; color: string }[] = [];

  loading = true;
  saving = false;
  errorMessage = '';

  constructor(
    private taskService: TaskService,
    private statusService: StatusService,
    private priorityService: PriorityService,
    private userService: UserService,
    private projectsService: ProjectsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Ideiglenesen hardcode-olt címkék (később lehet service)
    this.labels = [
      { id: 1, name: 'Frontend', color: '#315CE8' },
      { id: 2, name: 'UI', color: '#7C3AED' },
      { id: 3, name: 'API', color: '#0F766E' },
    ];

    forkJoin({
      statuses: this.statusService.getStatuses(),
      priorities: this.priorityService.getPriorities(),
      users: this.userService.getUsers(),
      projects: this.projectsService.getProjects(),
    }).subscribe({
      next: (data) => {
        this.statuses = data.statuses;
        this.priorities = data.priorities;
        this.users = data.users;
        this.projects = data.projects;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Nem sikerült betölteni az adatokat.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  toggleLabel(id: number): void {
    const index = this.selectedLabelIds.indexOf(id);
    if (index > -1) {
      this.selectedLabelIds.splice(index, 1);
    } else {
      this.selectedLabelIds.push(id);
    }
  }

  isLabelSelected(id: number): boolean {
    return this.selectedLabelIds.includes(id);
  }

  save(): void {
    this.errorMessage = '';

    if (!this.title.trim()) {
      this.errorMessage = 'A feladat címe kötelező.';
      return;
    }
    if (!this.projectId) {
      this.errorMessage = 'Válassz projektet.';
      return;
    }
    if (!this.assigneeId) {
      this.errorMessage = 'Válassz felelőst.';
      return;
    }
    if (!this.dueDate) {
      this.errorMessage = 'Add meg a határidőt.';
      return;
    }

    this.saving = true;

    const newTask = {
      projectId: asId(this.projectId!),
      title: this.title.trim(),
      description: this.description.trim(),
      assigneeId: asId(this.assigneeId!),
      statusId: asId(this.statusId),
      priorityId: asId(this.priorityId),
      dueDate: this.dueDate,
      estimateHours: this.estimateHours || 1,
      labelIds: this.selectedLabelIds,
    };

    this.taskService.addTask(newTask).subscribe({
      next: (created) => {
        this.router.navigate(['/feladatok', created.id]);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Hiba történt a mentés során.';
        this.saving = false;
        this.cdr.markForCheck();
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/feladatok']);
  }
}