import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLinkWithHref } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, RouterLinkWithHref],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('teamFlow');
}
