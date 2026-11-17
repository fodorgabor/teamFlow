import {
  AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input,
  OnDestroy, OnInit, Output, ViewChild, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ProjectService } from '../../core/api/project.service';
import { Project } from '../../models/project.model';
import { User } from '../../models/user.model';

function trimmedLength(min: number, max: number, required: boolean) {
  return (control: AbstractControl): ValidationErrors | null => {
    const len = String(control.value ?? '').trim().length;
    if (required && len === 0) return { required: true };
    if (len < min) return { minTrimmed: { min } };
    if (len > max) return { maxTrimmed: { max } };
    return null;
  };
}

function dateOrder(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value;
  const due = group.get('dueDate')?.value;
  return start && due && due < start ? { dateOrder: true } : null;
}

@Component({
  selector: 'app-projekt-urlap-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './projekt-urlap-modal.html',
  styleUrl: './projekt-urlap-modal.css'
})
export class ProjektUrlapModal implements OnInit, AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);

  @Input() project: Project | null = null;   // null = új projekt
  @Input() users: User[] = [];
  @Output() saved = new EventEmitter<Project>();
  @Output() closed = new EventEmitter<void>();
  @ViewChild('dialog') dialog?: ElementRef<HTMLElement>;

  saving = signal(false);
  saveError = signal('');
  submitted = signal(false);
  private lastFocused: HTMLElement | null = null;

  form = this.fb.group(
    {
      name: ['', trimmedLength(3, 80, true)],
      description: ['', trimmedLength(0, 1000, false)],
      ownerId: this.fb.control<number | null>(null, Validators.required),
      status: this.fb.control<'active' | 'archived'>('active', Validators.required),
      startDate: ['', Validators.required],
      dueDate: ['', Validators.required]
    },
    { validators: dateOrder }
  );

  ngOnInit(): void {
    this.lastFocused = document.activeElement as HTMLElement | null;
    if (this.project) {
      const { name, description, ownerId, status, startDate, dueDate } = this.project;
      this.form.patchValue({ name, description, ownerId, status, startDate, dueDate });
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.dialog?.nativeElement.focus());
  }

  ngOnDestroy(): void {
    // bezárás után a fókusz visszakerül arra a gombra, amivel megnyitották
    const el = this.lastFocused;
    setTimeout(() => el?.focus());
  }

  @HostListener('document:keydown.escape')
  close(): void {
    if (this.saving()) return;
    this.closed.emit();
  }

  save(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.saving()) return;

    const v = this.form.getRawValue();
    const data = {
      name: v.name!.trim(),
      description: (v.description ?? '').trim(),
      ownerId: Number(v.ownerId),
      status: v.status!,
      startDate: v.startDate!,
      dueDate: v.dueDate!
    };

    this.saving.set(true);
    this.saveError.set('');

    const request = this.project
      ? this.projectService.update(this.project.id, data)
      : this.projectService.create(data);

    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: project => this.saved.emit(project),
      error: () => this.saveError.set('A mentés nem sikerült. Az űrlap megmaradt, próbáld újra.')
    });
  }

  showError(name: 'name' | 'description' | 'ownerId' | 'startDate' | 'dueDate'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  showDateOrder(): boolean {
    return this.form.hasError('dateOrder') &&
      (this.form.controls.dueDate.touched || this.submitted());
  }

  trackById(index: number, item: { id: number }): number {
    return item.id;
  }
}