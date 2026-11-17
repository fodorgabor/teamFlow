import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { TaskService, Task } from '../../service/task-service';
import { StatusService, Status } from '../../service/status-service';
import { UserService, User } from '../../service/user-service';
import { ProjectsService, Project } from '../../service/projects-service';

export interface TaskView extends Task {
  statusName: string;
  statusKey: string;
  statusColor: string;
  assigneeName: string;
  projectName: string;
}

// A json-server az ID-ket néha szövegként adja vissza, ezért számként hasonlítunk
const sameId = (a: number | string, b: number | string): boolean =>
  Number(a) === Number(b);

@Component({
  selector: 'app-feladatok',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './feladatok.html',
  styleUrl: './feladatok.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Feladatok implements OnInit {
  tasks: TaskView[] = [];
  filteredTasks: TaskView[] = [];

  statuses: Status[] = [];
  users: User[] = [];
  projects: Project[] = [];

  // Szűrők
  searchTerm = '';
  statusFilter = 'all';
  assigneeFilter = 'all';
  projectFilter = 'all';

  loading = true;

  constructor(
    private taskService: TaskService,
    private statusService: StatusService,
    private userService: UserService,
    private projectsService: ProjectsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      tasks: this.taskService.getTasks(),
      statuses: this.statusService.getStatuses(),
      users: this.userService.getUsers(),
      projects: this.projectsService.getProjects(),
    }).subscribe({
      next: ({ tasks, statuses, users, projects }) => {
        this.statuses = statuses;
        this.users = users;
        this.projects = projects;

        this.tasks = tasks
          .map((task) => this.toTaskView(task, statuses, users, projects))
          .sort((a, b) => Number(a.id) - Number(b.id)); // Alapsorrend: id növekvő

        this.applyFilters();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Hiba az adatok betöltésekor:', err);
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private toTaskView(
    task: Task,
    statuses: Status[],
    users: User[],
    projects: Project[]
  ): TaskView {
    const status = statuses.find((s) => sameId(s.id, task.statusId));
    const user = users.find((u) => sameId(u.id, task.assigneeId));
    const project = projects.find((p) => sameId(p.id, task.projectId));

    return {
      ...task,
      statusName: status?.name ?? 'Ismeretlen',
      statusKey: status?.key ?? 'todo',
      statusColor: status?.color ?? '#667085',
      assigneeName: user?.name ?? 'Ismeretlen',
      projectName: project?.name ?? 'Ismeretlen projekt',
    };
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredTasks = this.tasks.filter((task) => {
      const matchesSearch =
        !term ||
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term) ||
        task.assigneeName.toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === 'all' || sameId(task.statusId, this.statusFilter);

      const matchesAssignee =
        this.assigneeFilter === 'all' || sameId(task.assigneeId, this.assigneeFilter);

      const matchesProject =
        this.projectFilter === 'all' || sameId(task.projectId, this.projectFilter);

      return matchesSearch && matchesStatus && matchesAssignee && matchesProject;
    });

    this.cdr.markForCheck();
  }

  get subtitle(): string {
    const total = this.tasks.length;
    const shown = this.filteredTasks.length;
    const projectCount = new Set(this.tasks.map((t) => t.projectId)).size;

    if (this.statusFilter === 'all' && this.assigneeFilter === 'all' && this.projectFilter === 'all' && !this.searchTerm) {
      return `${total} feladat · ${projectCount} projekt · minden állapot`;
    }
    return `${shown} / ${total} feladat`;
  }
}