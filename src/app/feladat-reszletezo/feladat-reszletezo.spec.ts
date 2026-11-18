import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { FeladatReszletezo } from "./feladat-reszletezo";

describe("FeladatReszletezo", () => {
  let component: FeladatReszletezo;
  let fixture: ComponentFixture<FeladatReszletezo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeladatReszletezo],
      providers: [provideRouter([{ path: 'feladatok', children: [] }])],
    }).compileComponents();

    fixture = TestBed.createComponent(FeladatReszletezo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
