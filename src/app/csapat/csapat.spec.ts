import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Csapat } from "./csapat";

describe("Csapat", () => {
  let component: Csapat;
  let fixture: ComponentFixture<Csapat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Csapat],
    }).compileComponents();

    fixture = TestBed.createComponent(Csapat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
