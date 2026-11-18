import { Component, ElementRef, HostListener, ViewChild, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
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
import { ProjektUrlapModal } from '../projekt-urlap-modal/projekt-urlap-modal';
import { sameId } from '../../core/utils/id';

type ModalMode = 'add' | 'edit' | 'remove';

function trimmedLength(min: number, max: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const len = String(control.value ?? '').trim().length;
    if (len === 0) return { required: true };
    if (len < min) return { minTrimmed: { min } };
    if (len > max) return { maxTrimmed: { max } };
    return null;
  };
}

@Component({
  selector: 'app-projekt-reszletezo',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, ProjektUrlapModal],
  templateUrl: './projekt-reszletezo.html',
  styleUrl: './projekt-reszletezo.css'
})
export class ProjektReszletezo implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly taskService = inject(TaskService);
  private readonly statusService = inject(StatusService);
  private readonly memberService = inject(ProjectMemberService);
  private readonly userService = inject(UserService);

  @ViewChild('dialog') dialog?: ElementRef<HTMLElement>;
  @ViewChild('delDialog') delDialog?: ElementRef<HTMLElement>;

  projectId = 0;
  project = signal<Project | null>(null);
  members = signal<ProjectMember[]>([]);
  tasks = signal<Task[]>([]);
  statuses = signal<Status[]>([]);
  users = signal<User[]>([]);

  loading = signal(true);
  errorMessage = signal('');
  notice = signal('');

  // projekt szerkesztés / törlés
  editOpen = signal(false);
  deleteOpen = signal(false);
  deleteChecking = signal(false);
  deleting = signal(false);
  deleteError = signal('');
  blockedTasks = signal<Task[]>([]);
  blockedMembers = signal<ProjectMember[]>([]);
  private deleteLastFocused: HTMLElement | null = null;

  // tag modal állapot
  modalMode = signal<ModalMode | null>(null);
  selectedMember = signal<ProjectMember | null>(null);
  saving = signal(false);
  saveError = signal('');
  submitted = signal(false);
  private lastFocused: HTMLElement | null = null;

  availableUsers = computed(() => {
    const taken = this.members().map(m => m.userId);
    return this.users().filter(u => !taken.some(id => sameId(id, u.id)));
  });

  deleteBlocked = computed(
    () => this.blockedTasks().length > 0 || this.blockedMembers().length > 0
  );

  form = this.fb.group({
    userId: this.fb.control<number | null>(null, Validators.required),
    role: this.fb.control('', trimmedLength(2, 40))
  });

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id') ?? '';
    const id = Number(raw);

    if (!/^\d+$/.test(raw) || id < 1) {
      this.fail('Hibás azonosító: a projekt azonosítója pozitív egész szám kell legyen.');
      return;
    }
    this.projectId = id;

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
        this.tasks.set(tasks.filter(t => sameId(t.projectId, id)));
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

  // ---------- projekt szerkesztés ----------

  onProjectSaved(project: Project): void {
    this.project.set(project);
    this.editOpen.set(false);
    this.notice.set('A projekt módosítása mentve.');
  }

  // ---------- projekt törlés ----------

  openDelete(): void {
    this.deleteLastFocused = document.activeElement as HTMLElement | null;
    this.deleteError.set('');
    this.blockedTasks.set([]);
    this.blockedMembers.set([]);
    this.deleteChecking.set(true);
    this.deleteOpen.set(true);
    setTimeout(() => this.delDialog?.nativeElement.focus());

    // a szerverről frissen lekérve ellenőrizzük a kapcsolatokat
    forkJoin({
      tasks: this.taskService.list(),
      members: this.memberService.list()
    })
      .pipe(finalize(() => this.deleteChecking.set(false)))
      .subscribe({
        next: ({ tasks, members }) => {
          this.blockedTasks.set(tasks.filter(t => sameId(t.projectId, this.projectId)));
          this.blockedMembers.set(members.filter(m => sameId(m.projectId, this.projectId)));
        },
        error: () => this.deleteError.set('A kapcsolatok ellenőrzése nem sikerült, ezért a törlés most nem indítható.')
      });
  }

  closeDelete(): void {
    if (this.deleting()) return;
    this.deleteOpen.set(false);
    setTimeout(() => this.deleteLastFocused?.focus());
  }

  confirmDelete(): void {
    if (this.deleting() || this.deleteChecking() || this.deleteBlocked() || this.deleteError()) return;
    this.deleting.set(true);
    this.deleteError.set('');

    this.projectService
      .remove(this.projectId)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/projektek']),
        error: () => this.deleteError.set('A törlés nem sikerült. Próbáld újra.')
      });
  }

  // ---------- tag modal ----------

  openAdd(): void {
    this.prepare('add', null);
    this.form.reset({ userId: null, role: '' });
    this.form.controls.userId.enable();
  }

  openEdit(member: ProjectMember): void {
    this.prepare('edit', member);
    this.form.reset({ userId: Number(member.userId), role: member.role });
    this.form.controls.userId.disable();
  }

  openRemove(member: ProjectMember): void {
    this.prepare('remove', member);
  }

  private prepare(mode: ModalMode, member: ProjectMember | null): void {
    this.lastFocused = document.activeElement as HTMLElement | null;
    this.selectedMember.set(member);
    this.saveError.set('');
    this.submitted.set(false);
    this.modalMode.set(mode);
    setTimeout(() => this.dialog?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  closeModal(): void {
    if (this.deleteOpen()) {
      this.closeDelete();
      return;
    }
    if (!this.modalMode() || this.saving()) return;
    this.modalMode.set(null);
    this.selectedMember.set(null);
    setTimeout(() => this.lastFocused?.focus());
  }

  save(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.saving()) return;

    const role = String(this.form.controls.role.value).trim();
    this.saving.set(true);
    this.saveError.set('');

    if (this.modalMode() === 'add') {
      const userId = Number(this.form.controls.userId.value);
      const exists = this.members().some(m => sameId(m.userId, userId));
      if (exists) {
        this.saving.set(false);
        this.saveError.set('Ez a felhasználó már tagja a projektnek.');
        return;
      }
      this.memberService
        .create({ projectId: this.projectId, userId, role })
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => this.afterWrite(),
          error: () => this.saveError.set('A mentés nem sikerült. Próbáld újra.')
        });
    } else {
      const member = this.selectedMember();
      if (!member) return;
      this.memberService
        .update(member.id, { role })
        .pipe(finalize(() => this.saving.set(false)))
        .subscribe({
          next: () => this.afterWrite(),
          error: () => this.saveError.set('A mentés nem sikerült. Próbáld újra.')
        });
    }
  }

  confirmRemove(): void {
    const member = this.selectedMember();
    if (!member || this.saving()) return;
    this.saving.set(true);
    this.saveError.set('');

    this.memberService
      .remove(member.id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.afterWrite(),
        error: () => this.saveError.set('Az eltávolítás nem sikerült. Próbáld újra.')
      });
  }

  private afterWrite(): void {
    this.memberService
      .list(new HttpParams().set('projectId', this.projectId))
      .subscribe({
        next: members => {
          this.members.set(members);
          this.closeModal();
        },
        error: () => this.saveError.set('A mentés sikerült, de a lista frissítése nem.')
      });
  }

  // ---------- segédek ----------

  showError(name: 'userId' | 'role'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  userName(id: number | string): string {
    return this.users().find(u => sameId(u.id, id))?.name ?? '–';
  }

  initials(id: number | string): string {
    return this.userName(id).split(' ').map(p => p[0]).join('');
  }

  statusOf(id: number | string): Status | undefined {
    return this.statuses().find(s => sameId(s.id, id));
  }

  trackById(index: number, item: { id: number | string }): number | string {
    return item.id;
  }
}