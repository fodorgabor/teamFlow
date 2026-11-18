import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { TaskService } from '../core/api/task-service';
import { StatusService } from '../core/api/status-service';
import { PriorityService } from '../core/api/priority-service';
import { UserService } from '../core/api/user-service';
import { ProjectService } from '../core/api/project.service';
import { CommentService } from '../core/api/comment-service';
import { ChecklistService } from '../core/api/checklist-service';
import { TimeEntryService } from '../core/api/time-entry-service';
import { Task } from '../models/task.model';
import { Status } from '../models/status.model';
import { Priority } from '../models/priority.model';
import { User } from '../models/user.model';
import { Project } from '../models/project.model';
import { Comment } from '../models/comment.model';
import { ChecklistItem } from '../models/checklist-item.model';
import { TimeEntry } from '../models/time-entry.model';
import { sameId } from '../core/utils/id';

@Component({
  selector: 'app-feladat-reszletezo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './feladat-reszletezo.html',
  styleUrl: './feladat-reszletezo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeladatReszletezo implements OnInit {
  task: Task | null = null;
  status: Status | null = null;
  priority: Priority | null = null;
  assignee: User | null = null;
  project: Project | null = null;

  checklist: ChecklistItem[] = [];
  comments: Comment[] = [];
  timeEntries: TimeEntry[] = [];
  users: User[] = [];

  // Új hozzászólás
  newComment = '';

  // Új checklist item
  newChecklistText = '';

  loading = true;
  error = '';
  actionError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private statusService: StatusService,
    private priorityService: PriorityService,
    private userService: UserService,
    private projectsService: ProjectService,
    private commentService: CommentService,
    private checklistService: ChecklistService,
    private timeEntryService: TimeEntryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Az ID lehet szám (1, 2, ...) vagy szöveg (az újonnan létrehozott feladatoknál)
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/feladatok']);
      return;
    }

    this.loadTask(id);
  }

  private loadTask(id: string): void {
    forkJoin({
      task: this.taskService.getById(id),
      statuses: this.statusService.list(),
      priorities: this.priorityService.list(),
      users: this.userService.list(),
      projects: this.projectsService.list(),
      checklist: this.checklistService.listByTask(id),
      comments: this.commentService.listByTask(id),
      timeEntries: this.timeEntryService.listByTask(id),
    }).subscribe({
      next: (data) => {
        this.task = data.task;
        this.users = data.users;
        this.status = data.statuses.find(s => sameId(s.id, data.task.statusId)) ?? null;
        this.priority = data.priorities.find(p => sameId(p.id, data.task.priorityId)) ?? null;
        this.assignee = data.users.find(u => sameId(u.id, data.task.assigneeId)) ?? null;
        this.project = data.projects.find(p => sameId(p.id, data.task.projectId)) ?? null;
        this.checklist = data.checklist;
        this.comments = data.comments;
        this.timeEntries = data.timeEntries;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Nem sikerült betölteni a feladatot.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private showError(message: string): void {
    this.actionError = message;
    this.cdr.markForCheck();
  }

  // Checklist
  toggleChecklist(item: ChecklistItem): void {
    const updated = { ...item, done: !item.done };
    this.checklistService.update(updated.id, { done: updated.done }).subscribe({
      next: () => {
        item.done = !item.done;
        this.cdr.markForCheck();
      },
      error: () => this.showError('A módosítás nem sikerült.'),
    });
  }

  addChecklistItem(): void {
    if (!this.newChecklistText.trim() || !this.task) return;

    this.checklistService.create({
      taskId: this.task.id,
      text: this.newChecklistText.trim(),
      done: false,
    }).subscribe({
      next: (created) => {
        this.checklist.push(created);
        this.newChecklistText = '';
        this.cdr.markForCheck();
      },
      error: () => this.showError('A tétel hozzáadása nem sikerült.'),
    });
  }

  deleteChecklistItem(item: ChecklistItem): void {
    this.checklistService.remove(item.id).subscribe({
      next: () => {
        this.checklist = this.checklist.filter(c => !sameId(c.id, item.id));
        this.cdr.markForCheck();
      },
      error: () => this.showError('A törlés nem sikerült.'),
    });
  }

  // Hozzászólások
  addComment(): void {
    if (!this.newComment.trim() || !this.task) return;

    // Ideiglenesen mindig az 1-es user (Kiss Anna) ír
    this.commentService.create({
      taskId: this.task.id,
      userId: 1,
      body: this.newComment.trim(),
    }).subscribe({
      next: (created) => {
        this.comments.push(created);
        this.newComment = '';
        this.cdr.markForCheck();
      },
      error: () => this.showError('A hozzászólás mentése nem sikerült.'),
    });
  }

  getUserName(userId: number | string): string {
    return this.users.find(u => sameId(u.id, userId))?.name ?? 'Ismeretlen';
  }

  get doneCount(): number {
    return this.checklist.filter(c => c.done).length;
  }

  get loggedMinutes(): number {
    return this.timeEntries.reduce((sum, e) => sum + e.minutes, 0);
  }

  get loggedHoursText(): string {
    const hours = Math.floor(this.loggedMinutes / 60);
    const mins = this.loggedMinutes % 60;
    if (hours === 0) return `${mins} perc`;
    if (mins === 0) return `${hours} óra`;
    return `${hours} óra ${mins} perc`;
  }

  deleteTask(): void {
    if (!this.task || !confirm('Biztosan törölni szeretnéd ezt a feladatot?')) return;

    this.taskService.remove(this.task.id).subscribe({
      next: () => this.router.navigate(['/feladatok']),
      error: () => this.showError('A feladat törlése nem sikerült.'),
    });
  }
}