import {
  AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Input,
  OnDestroy, OnInit, Output, ViewChild, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserService } from '../../core/api/user-service';
import { User } from '../../models/user.model';

function trimmedLength(min: number, max: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const length = String(control.value ?? '').trim().length;
    if (length === 0) return { required: true };
    if (length < min) return { minTrimmed: { min } };
    if (length > max) return { maxTrimmed: { max } };
    return null;
  };
}

@Component({
  selector: 'app-felhasznalo-urlap-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './felhasznalo-urlap-modal.html',
  styleUrl: './felhasznalo-urlap-modal.css'
})
export class FelhasznaloUrlapModal implements OnInit, AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  @Input() user: User | null = null;
  @Input() users: User[] = [];
  @Output() saved = new EventEmitter<User>();
  @Output() closed = new EventEmitter<void>();
  @ViewChild('dialog') dialog?: ElementRef<HTMLElement>;

  saving = signal(false);
  saveError = signal('');
  submitted = signal(false);
  private lastFocused: HTMLElement | null = null;

  private readonly uniqueEmail = (control: AbstractControl): ValidationErrors | null => {
    const email = String(control.value ?? '').trim().toLowerCase();
    if (!email) return null;
    const duplicate = this.users.some(candidate =>
      candidate.id !== this.user?.id && candidate.email.trim().toLowerCase() === email
    );
    return duplicate ? { emailTaken: true } : null;
  };

  form = this.fb.nonNullable.group({
    name: ['', trimmedLength(2, 60)],
    email: ['', [Validators.required, Validators.email, this.uniqueEmail]],
    role: ['', trimmedLength(2, 40)],
    active: [true]
  });

  ngOnInit(): void {
    this.lastFocused = document.activeElement as HTMLElement | null;
    if (this.user) {
      this.form.patchValue({
        name: this.user.name,
        email: this.user.email,
        role: this.user.role,
        active: this.user.active
      });
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.dialog?.nativeElement.focus());
  }

  ngOnDestroy(): void {
    const element = this.lastFocused;
    setTimeout(() => element?.focus());
  }

  @HostListener('document:keydown.escape')
  close(): void {
    if (this.saving()) return;
    this.closed.emit();
  }

  save(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.saving()) return;

    const value = this.form.getRawValue();
    const data = {
      name: value.name.trim(),
      email: value.email.trim(),
      role: value.role.trim(),
      active: value.active
    };

    this.saving.set(true);
    this.saveError.set('');
    const request = this.user
      ? this.userService.update(this.user.id, data)
      : this.userService.create(data);

    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: user => this.saved.emit(user),
      error: () => this.saveError.set('A mentés nem sikerült. Az űrlap megmaradt, próbáld újra.')
    });
  }

  showError(name: 'name' | 'email' | 'role'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }
}
