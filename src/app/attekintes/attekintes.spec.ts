import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Attekintes } from "./attekintes";

describe("Attekintes", () => {
  let component: Attekintes;
  let fixture: ComponentFixture<Attekintes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Attekintes],
    }).compileComponents();

    fixture = TestBed.createComponent(Attekintes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
