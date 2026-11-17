import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ProjectService } from '../core/api/project.service';
import { TaskService } from '../core/api/task-service';
import { StatusService } from '../core/api/status-service';
import { ProjectMemberService } from '../core/api/project-member-service';
import { UserService } from '../core/api/user-service';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { ProjektUrlapModal } from './projekt-urlap-modal/projekt-urlap-modal';

interface ProjectCard {
  project: Project;
  total: number;
  done: number;
  percent: number;
  initials: string[];
}

@Component({
  selector: 'app-projektek',
  standalone: true,
  imports: [CommonModule, ProjektUrlapModal],
  templateUrl: './projektek.html',
  styleUrl: './projektek.css'
})
export class Projektek implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);
  private readonly statusService = inject(StatusService);
  private readonly memberService = inject(ProjectMemberService);
  private readonly userService = inject(UserService);

  cards = signal<ProjectCard[]>([]);
  users = signal<User[]>([]);
  loading = signal(true);
  error = signal(false);
  createOpen = signal(false);
  notice = signal('');

  activeCount = computed(
    () => this.cards().filter(c => c.project.status === 'active').length
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    forkJoin({
      projects: this.projectService.list(),
      tasks: this.taskService.list(),
      statuses: this.statusService.list(),
      members: this.memberService.list(),
      users: this.userService.list()
    }).subscribe({
      next: ({ projects, tasks, statuses, members, users }) => {
        const doneId = statuses.find(s => s.key === 'done')?.id;
        this.users.set(users);

        this.cards.set(
          projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const done = projectTasks.filter(t => t.statusId === doneId).length;
            const total = projectTasks.length;

            const initials = members
              .filter(m => m.projectId === project.id)
              .map(m => users.find(u => u.id === m.userId))
              .filter(u => !!u)
              .map(u => u!.name.split(' ').map(part => part[0]).join(''));

            return {
              project,
              total,
              done,
              percent: total ? Math.round((done / total) * 100) : 0,
              initials
            };
          })
        );
        this.error.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  onCreated(project: Project): void {
    this.createOpen.set(false);
    this.notice.set(`A(z) „${project.name}” projekt létrejött.`);
    this.load();
  }

  trackById(index: number, card: ProjectCard): number {
    return card.project.id;
  }
}