import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ProjectService } from '../core/api/project.service';
import { TaskService } from '../core/api/task-service';
import { StatusService } from '../core/api/status-service';
import { Project } from '../models/project.model';

interface ProjectCard {
  project: Project;
  total: number;
  done: number;
  percent: number;
}

@Component({
  selector: 'app-projektek',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projektek.html',
  styleUrl: './projektek.css'
})
export class Projektek implements OnInit {
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);
  private readonly statusService = inject(StatusService);

  cards = signal<ProjectCard[]>([]);
  activeCount = computed(() => this.cards().filter(card => card.project.status === 'active').length);
  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    forkJoin({
      projects: this.projectService.list(),
      tasks: this.taskService.list(),
      statuses: this.statusService.list()
    }).subscribe({
      next: ({ projects, tasks, statuses }) => {
        const doneId = statuses.find(s => s.key === 'done')?.id;

        this.cards.set(
          projects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const done = projectTasks.filter(t => t.statusId === doneId).length;
            const total = projectTasks.length;
            return {
              project,
              total,
              done,
              percent: total ? Math.round((done / total) * 100) : 0
            };
          })
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  trackById(index: number, card: ProjectCard): number {
    return card.project.id;
  }
}