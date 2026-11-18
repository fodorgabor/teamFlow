import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: {
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class App {
  menuOpen = signal(false);

  navItems = [
    { path: '/', label: 'Áttekintés', icon: 'A', exact: true },
    { path: '/feladatok', label: 'Feladatok', icon: 'F', exact: false },
    { path: '/projektek', label: 'Projektek', icon: 'P', exact: false },
    { path: '/csapat', label: 'Csapat', icon: 'C', exact: false },
    { path: '/torzsadatok', label: 'Törzsadatok', icon: 'T', exact: false },
  ];

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}