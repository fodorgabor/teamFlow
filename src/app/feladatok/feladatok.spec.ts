import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { Feladatok } from "./feladatok";

describe("Feladatok", () => {
  let component: Feladatok;
  let fixture: ComponentFixture<Feladatok>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Feladatok],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Feladatok);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
