import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { Projektek } from "./projektek";

describe("Projektek", () => {
  let component: Projektek;
  let fixture: ComponentFixture<Projektek>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projektek],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Projektek);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
