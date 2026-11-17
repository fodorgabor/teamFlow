import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Project, ProjectsService } from "../../service/projects-service";

@Component({
  selector: "app-projektek",
  imports: [],
  templateUrl: "./projektek.html",
  styleUrl: "./projektek.css",
})
export class Projektek implements OnInit {
  projects: Project[] = [];

  constructor(private readonly projectsService: ProjectsService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.projectsService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Hiba a projectek lekérésekor:", error);
      },
    });
  }
}
