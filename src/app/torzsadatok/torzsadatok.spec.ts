import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Torzsadatok } from "./torzsadatok";

describe("Torzsadatok", () => {
  let component: Torzsadatok;
  let fixture: ComponentFixture<Torzsadatok>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Torzsadatok],
    }).compileComponents();

    fixture = TestBed.createComponent(Torzsadatok);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
