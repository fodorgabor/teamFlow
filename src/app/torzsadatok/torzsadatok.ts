import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observer, forkJoin } from 'rxjs';

import { TaskService } from '../core/api/task-service';
import { LabelService } from '../core/api/label-service';
import { StatusService } from '../core/api/status-service';
import { PriorityService } from '../core/api/priority-service';
import { Task } from '../models/task.model';
import { Label } from '../models/label.model';
import { Status } from '../models/status.model';
import { Priority } from '../models/priority.model';
import { sameId } from '../core/utils/id';

type Tab = 'labels' | 'statuses' | 'priorities';

@Component({
  selector: 'app-torzsadatok',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './torzsadatok.html',
  styleUrl: './torzsadatok.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Torzsadatok implements OnInit {
  private labelService = inject(LabelService);

  tab: Tab = 'labels';

  labels: Label[] = [];
  statuses: Status[] = [];
  priorities: Priority[] = [];
  tasks: Task[] = [];

  loading = true;
  saving = false;
  errorMessage = '';

  // Űrlap (új / szerkesztés)
  formOpen = false;
  editingId: number | string | null = null;
  form = { name: '', color: '#315CE8', key: '', order: 1, level: 1 };

  constructor(
    private taskService: TaskService,
    private statusService: StatusService,
    private priorityService: PriorityService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    forkJoin({
      tasks: this.taskService.list(),
      labels: this.labelService.list(),
      statuses: this.statusService.list(),
      priorities: this.priorityService.list(),
    }).subscribe({
      next: (data) => {
        this.tasks = data.tasks;
        this.labels = data.labels;
        this.statuses = [...data.statuses].sort((a, b) => a.order - b.order);
        this.priorities = [...data.priorities].sort((a, b) => a.level - b.level);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Nem sikerült betölteni az adatokat.';
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  // ---------- Fülek ----------

  setTab(tab: Tab): void {
    this.tab = tab;
    this.closeForm();
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  get newButtonText(): string {
    switch (this.tab) {
      case 'labels': return '+ Új címke';
      case 'statuses': return '+ Új állapot';
      default: return '+ Új prioritás';
    }
  }

  get countText(): string {
    switch (this.tab) {
      case 'labels': return `${this.labels.length} címke`;
      case 'statuses': return `${this.statuses.length} állapot`;
      default: return `${this.priorities.length} prioritás`;
    }
  }

  // ---------- Űrlap ----------

  openNew(): void {
    this.errorMessage = '';
    this.editingId = null;
    this.form = {
      name: '',
      color: '#315CE8',
      key: '',
      order: this.statuses.length + 1,
      level: this.priorities.length + 1,
    };
    this.formOpen = true;
    this.cdr.markForCheck();
  }

  editLabel(label: Label): void {
    this.errorMessage = '';
    this.editingId = label.id;
    this.form = { ...this.form, name: label.name, color: label.color };
    this.formOpen = true;
    this.cdr.markForCheck();
  }

  editStatus(status: Status): void {
    this.errorMessage = '';
    this.editingId = status.id;
    this.form = {
      ...this.form,
      name: status.name,
      color: status.color,
      key: status.key,
      order: status.order,
    };
    this.formOpen = true;
    this.cdr.markForCheck();
  }

  editPriority(priority: Priority): void {
    this.errorMessage = '';
    this.editingId = priority.id;
    this.form = { ...this.form, name: priority.name, level: priority.level };
    this.formOpen = true;
    this.cdr.markForCheck();
  }

  closeForm(): void {
    this.formOpen = false;
    this.editingId = null;
    this.saving = false;
  }

  cancelForm(): void {
    this.closeForm();
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  // ---------- Mentés ----------

  save(): void {
    this.errorMessage = '';
    const name = this.form.name.trim();

    if (!name) {
      this.fail('A név kötelező.');
      return;
    }
    if (this.tab !== 'priorities' && !/^#[0-9a-fA-F]{6}$/.test(this.form.color)) {
      this.fail('A színt #RRGGBB formátumban add meg (pl. #315CE8).');
      return;
    }
    if (this.tab === 'statuses' && !this.form.key.trim()) {
      this.fail('Az állapot kulcsa kötelező (pl. todo, doing, done).');
      return;
    }

    this.saving = true;

    switch (this.tab) {
      case 'labels': this.saveLabel(name); break;
      case 'statuses': this.saveStatus(name); break;
      default: this.savePriority(name); break;
    }
  }

  private saveLabel(name: string): void {
    const color = this.form.color;

    if (this.editingId === null) {
      this.labelService.create({ name, color }).subscribe(
        this.handle<Label>((created) => {
          this.labels = [...this.labels, created];
        })
      );
    } else {
      this.labelService.update(this.editingId, { name, color }).subscribe(
        this.handle<Label>((saved) => {
          this.labels = this.labels.map((l) => (sameId(l.id, saved.id) ? saved : l));
        })
      );
    }
  }

  private saveStatus(name: string): void {
    const data = {
      name,
      key: this.form.key.trim(),
      color: this.form.color,
      order: Number(this.form.order) || 1,
    };

    if (this.editingId === null) {
      this.statusService.create(data).subscribe(
        this.handle<Status>((created) => {
          this.statuses = [...this.statuses, created].sort((a, b) => a.order - b.order);
        })
      );
    } else {
      this.statusService.update(this.editingId, data).subscribe(
        this.handle<Status>((saved) => {
          this.statuses = this.statuses
            .map((s) => (sameId(s.id, saved.id) ? saved : s))
            .sort((a, b) => a.order - b.order);
        })
      );
    }
  }

  private savePriority(name: string): void {
    const level = Number(this.form.level) || 1;

    if (this.editingId === null) {
      this.priorityService.create({ name, level }).subscribe(
        this.handle<Priority>((created) => {
          this.priorities = [...this.priorities, created].sort((a, b) => a.level - b.level);
        })
      );
    } else {
      this.priorityService.update(this.editingId, { name, level }).subscribe(
        this.handle<Priority>((saved) => {
          this.priorities = this.priorities
            .map((p) => (sameId(p.id, saved.id) ? saved : p))
            .sort((a, b) => a.level - b.level);
        })
      );
    }
  }

  private handle<T>(apply: (value: T) => void): Partial<Observer<T>> {
    return {
      next: (value: T) => {
        apply(value);
        this.closeForm();
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error(err);
        this.saving = false;
        this.fail('A mentés nem sikerült.');
      },
    };
  }

  // ---------- Törlés (kapcsolat-ellenőrzéssel) ----------

  removeLabel(label: Label): void {
    const used = this.tasks.filter((t) =>
      (t.labelIds ?? []).some((id) => sameId(id, label.id))
    ).length;
    if (this.blockedByUsage(label.name, used)) return;
    if (!confirm(`Biztosan törölni szeretnéd: ${label.name}?`)) return;

    this.labelService.remove(label.id).subscribe({
      next: () => {
        this.labels = this.labels.filter((l) => !sameId(l.id, label.id));
        this.cdr.markForCheck();
      },
      error: (err) => this.deleteFailed(err),
    });
  }

  removeStatus(status: Status): void {
    const used = this.tasks.filter((t) => sameId(t.statusId, status.id)).length;
    if (this.blockedByUsage(status.name, used)) return;
    if (!confirm(`Biztosan törölni szeretnéd: ${status.name}?`)) return;

    this.statusService.remove(status.id).subscribe({
      next: () => {
        this.statuses = this.statuses.filter((s) => !sameId(s.id, status.id));
        this.cdr.markForCheck();
      },
      error: (err) => this.deleteFailed(err),
    });
  }

  removePriority(priority: Priority): void {
    const used = this.tasks.filter((t) => sameId(t.priorityId, priority.id)).length;
    if (this.blockedByUsage(priority.name, used)) return;
    if (!confirm(`Biztosan törölni szeretnéd: ${priority.name}?`)) return;

    this.priorityService.remove(priority.id).subscribe({
      next: () => {
        this.priorities = this.priorities.filter((p) => !sameId(p.id, priority.id));
        this.cdr.markForCheck();
      },
      error: (err) => this.deleteFailed(err),
    });
  }

  private blockedByUsage(name: string, used: number): boolean {
    if (used > 0) {
      this.fail(
        `„${name}” nem törölhető, mert ${used} feladat hivatkozik rá. Előbb szüntesd meg a kapcsolatokat.`
      );
      return true;
    }
    return false;
  }

  private deleteFailed(err: { status?: number }): void {
    console.error('Törlési hiba:', err);
    if (err.status === 404) {
      this.fail('Ez az elem már nem létezik a szerveren, ezért frissítettem a listát.');
      this.loadAll();
      return;
    }
    this.fail(`A törlés nem sikerült (HTTP ${err.status ?? 'ismeretlen'}).`);
  }

  private fail(message: string): void {
    this.errorMessage = message;
    this.cdr.markForCheck();
  }
}