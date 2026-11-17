import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { TaskService, Task } from '../../service/task-service';
import { StatusService, Status } from '../../service/status-service';
import { UserService, User } from '../../service/user-service';
import { ProjectsService, Project } from '../../service/projects-service';
import { TimeEntryService } from '../../service/time-entry-service';

export interface DashboardTask extends Task {
  statusName: string;
  statusColor: string;
  assigneeName: string;
  projectName: string;
}

// Az ID lehet szám (1) vagy szöveg ("xVd4Mp6UZNA"), ezért szövegként hasonlítunk
const sameId = (a: number | string, b: number | string): boolean =>
  String(a) === String(b);

@Component({
  selector: 'app-attekintes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './attekintes.html',
  styleUrl: './attekintes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Attekintes implements OnInit {
  // Összesítő kártyák
  totalTasks = 0;
  projectCount = 0;
  inProgressCount = 0;
  doneCount = 0;
  donePercent = 0;
  loggedMinutes = 0;

  // Legközelebbi nyitott feladatok
  upcomingTasks: DashboardTask[] = [];

  loading = true;
  errorMessage = '';

  constructor(
    private taskService: TaskService,
    private statusService: StatusService,
    private userService: UserService,
    private projectsService: ProjectsService,
    private timeEntryService: TimeEntryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    forkJoin({
      tasks: this.taskService.getTasks(),
      statuses: this.statusService.getStatuses(),
      users: this.userService.getUsers(),
      projects: this.projectsService.getProjects(),
      timeEntries: this.timeEntryService.getAll(),
    }).subscribe({
      next: ({ tasks, statuses, users, projects, timeEntries }) => {
        this.buildStats(tasks, statuses, timeEntries.map((e) => e.minutes));
        this.upcomingTasks = this.buildUpcoming(tasks, statuses, users, projects);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Hiba az adatok betöltésekor:', err);
        this.errorMessage = 'Nem sikerült betölteni az adatokat.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private statusKeyOf(task: Task, statuses: Status[]): string {
    return statuses.find((s) => sameId(s.id, task.statusId))?.key ?? '';
  }

  private buildStats(tasks: Task[], statuses: Status[], minutes: number[]): void {
    this.totalTasks = tasks.length;
    this.projectCount = new Set(tasks.map((t) => String(t.projectId))).size;
    this.inProgressCount = tasks.filter((t) => this.statusKeyOf(t, statuses) === 'doing').length;
    this.doneCount = tasks.filter((t) => this.statusKeyOf(t, statuses) === 'done').length;
    this.donePercent = this.totalTasks
      ? Math.round((this.doneCount / this.totalTasks) * 100)
      : 0;
    this.loggedMinutes = minutes.reduce((sum, m) => sum + m, 0);
  }

  private buildUpcoming(
    tasks: Task[],
    statuses: Status[],
    users: User[],
    projects: Project[]
  ): DashboardTask[] {
    return tasks
      .filter((t) => this.statusKeyOf(t, statuses) !== 'done') // csak a nyitott feladatok
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)) // dueDate szerint növekvő
      .slice(0, 5)
      .map((task) => {
        const status = statuses.find((s) => sameId(s.id, task.statusId));
        const user = users.find((u) => sameId(u.id, task.assigneeId));
        const project = projects.find((p) => sameId(p.id, task.projectId));

        return {
          ...task,
          statusName: status?.name ?? 'Ismeretlen',
          statusColor: status?.color ?? '#667085',
          assigneeName: user?.name ?? 'Ismeretlen',
          projectName: project?.name ?? 'Ismeretlen projekt',
        };
      });
  }

  // 150 perc -> "2,5 óra"
  get loggedHoursText(): string {
    const hours = Math.round((this.loggedMinutes / 60) * 10) / 10;
    return `${String(hours).replace('.', ',')} óra`;
  }
}