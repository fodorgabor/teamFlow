import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { CommentService } from "../core/api/comment-service";
import { ProjectService } from "../core/api/project.service";
import { ProjectMemberService } from "../core/api/project-member-service";
import { TaskService } from "../core/api/task-service";
import { TimeEntryService } from "../core/api/time-entry-service";
import { UserService } from "../core/api/user-service";

import { Csapat } from "./csapat";

describe("Csapat", () => {
  let component: Csapat;
  let fixture: ComponentFixture<Csapat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Csapat],
      providers: [
        { provide: UserService, useValue: { list: () => of([]) } },
        { provide: ProjectService, useValue: { list: () => of([]) } },
        { provide: ProjectMemberService, useValue: { list: () => of([]) } },
        { provide: TaskService, useValue: { list: () => of([]) } },
        { provide: CommentService, useValue: { list: () => of([]) } },
        { provide: TimeEntryService, useValue: { list: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Csapat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
