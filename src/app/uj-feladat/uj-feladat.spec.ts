import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UjFeladat } from "../uj-feladat/uj-feladat";

describe("UjFeladat", () => {
  let component: UjFeladat;
  let fixture: ComponentFixture<UjFeladat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UjFeladat],
    }).compileComponents();

    fixture = TestBed.createComponent(UjFeladat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
