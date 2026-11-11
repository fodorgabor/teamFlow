import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';

@Component({
  imports: [RouterOutlet, CommonModule, RouterLinkWithHref],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('teamFlow');
}
