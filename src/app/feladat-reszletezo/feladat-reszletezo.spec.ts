import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FeladatReszletezo } from "./feladat-reszletezo";

describe("FeladatReszletezo", () => {
  let component: FeladatReszletezo;
  let fixture: ComponentFixture<FeladatReszletezo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeladatReszletezo],
    }).compileComponents();

    fixture = TestBed.createComponent(FeladatReszletezo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
