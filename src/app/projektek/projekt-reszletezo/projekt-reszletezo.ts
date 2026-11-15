import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProjectService } from '../../core/api/project.service';
import { TaskService } from '../../core/api/task-service';
import { StatusService } from '../../core/api/status-service';
import { ProjectMemberService } from '../../core/api/project-member-service';
import { UserService } from '../../core/api/user-service';
import { Project } from '../../models/project.model';
import { Task } from '../../models/task.model';
import { Status } from '../../models/status.model';
import { User } from '../../models/user.model';
import { ProjectMember } from '../../models/projectMember.model';

@Component({
  selector: 'app-projekt-reszletezo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './projekt-reszletezo.html',
  styleUrl: './projekt-reszletezo.css'
})
export class ProjektReszletezo implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);
  private readonly statusService = inject(StatusService);
  private readonly memberService = inject(ProjectMemberService);
  private readonly userService = inject(UserService);

  project = signal<Project | null>(null);
  members = signal<ProjectMember[]>([]);
  tasks = signal<Task[]>([]);
  statuses = signal<Status[]>([]);
  users = signal<User[]>([]);

  loading = signal(true);
  errorMessage = signal('');

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id') ?? '';
    const id = Number(raw);

    if (!/^\d+$/.test(raw) || id < 1) {
      this.fail('Hibás azonosító: a projekt azonosítója pozitív egész szám kell legyen.');
      return;
    }

    forkJoin({
      project: this.projectService.getById(id),
      members: this.memberService.list(new HttpParams().set('projectId', id)),
      tasks: this.taskService.list(),
      statuses: this.statusService.list(),
      users: this.userService.list()
    }).subscribe({
      next: ({ project, members, tasks, statuses, users }) => {
        this.project.set(project);
        this.members.set(members);
        this.tasks.set(tasks.filter(t => t.projectId === id));
        this.statuses.set(statuses);
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.fail('Nem létezik ilyen projekt.');
        } else {
          this.fail('Nem érhető el a kiszolgáló. Próbáld újra később.');
        }
      }
    });
  }

  private fail(message: string): void {
    this.errorMessage.set(message);
    this.loading.set(false);
  }

  userName(id: number): string {
    return this.users().find(u => u.id === id)?.name ?? '–';
  }

  initials(id: number): string {
    return this.userName(id).split(' ').map(p => p[0]).join('');
  }

  statusOf(id: number): Status | undefined {
    return this.statuses().find(s => s.id === id);
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}