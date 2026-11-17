import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProjektUrlapModal } from "./projekt-urlap-modal";

describe("ProjektUrlapModal", () => {
  let component: ProjektUrlapModal;
  let fixture: ComponentFixture<ProjektUrlapModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjektUrlapModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjektUrlapModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
