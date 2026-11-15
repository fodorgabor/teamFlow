import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProjektReszletezo } from "./projekt-reszletezo";

describe("ProjektReszletezo", () => {
  let component: ProjektReszletezo;
  let fixture: ComponentFixture<ProjektReszletezo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjektReszletezo],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjektReszletezo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
