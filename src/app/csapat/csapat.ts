import { Component, HostListener, OnInit, computed, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CommentService } from '../core/api/comment-service';
import { ProjectService } from '../core/api/project.service';
import { ProjectMemberService } from '../core/api/project-member-service';
import { TaskService } from '../core/api/task-service';
import { TimeEntryService } from '../core/api/time-entry-service';
import { UserService } from '../core/api/user-service';
import { Comment } from '../models/comment.model';
import { Project } from '../models/project.model';
import { ProjectMember } from '../models/projectMember.model';
import { Task } from '../models/task.model';
import { TimeEntry } from '../models/time-entry.model';
import { User } from '../models/user.model';
import { FelhasznaloUrlapModal } from './felhasznalo-urlap-modal/felhasznalo-urlap-modal';
import { sameId } from '../core/utils/id';

interface DeleteBlockers {
  projects: Project[];
  projectMembers: ProjectMember[];
  tasks: Task[];
  comments: Comment[];
  timeEntries: TimeEntry[];
}

@Component({
  selector: 'app-csapat',
  standalone: true,
  imports: [CommonModule, FelhasznaloUrlapModal],
  templateUrl: './csapat.html',
  styleUrl: './csapat.css'
})
export class Csapat implements OnInit {
  private readonly userService = inject(UserService);
  private readonly projectService = inject(ProjectService);
  private readonly projectMemberService = inject(ProjectMemberService);
  private readonly taskService = inject(TaskService);
  private readonly commentService = inject(CommentService);
  private readonly timeEntryService = inject(TimeEntryService);

  @ViewChild('deleteDialog') deleteDialog?: ElementRef<HTMLElement>;

  users = signal<User[]>([]);
  loading = signal(true);
  error = signal(false);
  notice = signal('');
  formOpen = signal(false);
  selectedUser = signal<User | null>(null);

  deleteOpen = signal(false);
  deleteChecking = signal(false);
  deleting = signal(false);
  deleteError = signal('');
  deleteBlockers = signal<DeleteBlockers | null>(null);
  private deleteLastFocused: HTMLElement | null = null;

  activeCount = computed(() => this.users().filter(user => user.active).length);
  hasDeleteBlockers = computed(() => {
    const blockers = this.deleteBlockers();
    return !!blockers && (
      blockers.projects.length > 0 ||
      blockers.projectMembers.length > 0 ||
      blockers.tasks.length > 0 ||
      blockers.comments.length > 0 ||
      blockers.timeEntries.length > 0
    );
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);

    this.userService.list().subscribe({
      next: users => {
        this.users.set(users);
        this.error.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  openCreate(): void {
    this.selectedUser.set(null);
    this.formOpen.set(true);
  }

  openEdit(user: User): void {
    this.selectedUser.set(user);
    this.formOpen.set(true);
  }

  onSaved(user: User): void {
    const created = this.selectedUser() === null;
    this.formOpen.set(false);
    this.selectedUser.set(null);
    this.notice.set(created ? 'A csapattag létrejött.' : 'A csapattag módosítva.');
    this.load();
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.selectedUser.set(null);
  }

  openDelete(user: User): void {
    this.deleteLastFocused = document.activeElement as HTMLElement | null;
    this.selectedUser.set(user);
    this.deleteError.set('');
    this.deleteBlockers.set(null);
    this.deleteOpen.set(true);
    setTimeout(() => this.deleteDialog?.nativeElement.focus());
    this.checkDeleteRelations(user);
  }

  checkDeleteRelations(user: User): void {
    this.deleteChecking.set(true);
    this.deleteError.set('');
    this.deleteBlockers.set(null);

    forkJoin({
      projects: this.projectService.list(),
      projectMembers: this.projectMemberService.list(),
      tasks: this.taskService.list(),
      comments: this.commentService.list(),
      timeEntries: this.timeEntryService.list()
    })
      .pipe(finalize(() => this.deleteChecking.set(false)))
      .subscribe({
        next: ({ projects, projectMembers, tasks, comments, timeEntries }) => {
          this.deleteBlockers.set({
            projects: projects.filter(project => sameId(project.ownerId, user.id)),
            projectMembers: projectMembers.filter(member => sameId(member.userId, user.id)),
            tasks: tasks.filter(task => sameId(task.assigneeId, user.id)),
            comments: comments.filter(comment => sameId(comment.userId, user.id)),
            timeEntries: timeEntries.filter(entry => sameId(entry.userId, user.id))
          });
        },
        error: () => {
          this.deleteError.set(
            'A kapcsolatok ellenőrzése nem sikerült, ezért a törlés nem indítható. Próbáld újra.'
          );
        }
      });
  }

  closeDelete(): void {
    if (this.deleting()) return;
    this.deleteOpen.set(false);
    this.selectedUser.set(null);
    setTimeout(() => this.deleteLastFocused?.focus());
  }

  confirmDelete(): void {
    const user = this.selectedUser();
    if (
      !user ||
      this.deleting() ||
      this.deleteChecking() ||
      this.deleteError() ||
      !this.deleteBlockers() ||
      this.hasDeleteBlockers()
    ) {
      return;
    }

    this.deleting.set(true);
    this.deleteError.set('');
    this.userService.remove(user.id).pipe(finalize(() => this.deleting.set(false))).subscribe({
      next: () => {
        this.deleteOpen.set(false);
        this.selectedUser.set(null);
        this.notice.set('A csapattag törölve.');
        setTimeout(() => this.deleteLastFocused?.focus());
        this.load();
      },
      error: () => this.deleteError.set('A törlés nem sikerült. Próbáld újra.')
    });
  }

  initials(name: string): string {
    return name.trim().split(/\s+/).filter(Boolean).map(part => part[0]).join('').toUpperCase();
  }

  projectName(id: number | string): string {
    return `Projekt #${id}`;
  }

  trackById(index: number, item: { id: number | string }): number | string {
    return item.id;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.deleteOpen()) {
      this.closeDelete();
    }
  }
}
