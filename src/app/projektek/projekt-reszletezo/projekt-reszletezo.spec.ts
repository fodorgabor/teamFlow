import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { ProjektReszletezo } from "./projekt-reszletezo";

describe("ProjektReszletezo", () => {
  let component: ProjektReszletezo;
  let fixture: ComponentFixture<ProjektReszletezo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjektReszletezo],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjektReszletezo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
