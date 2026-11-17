import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FelhasznaloUrlapModal } from './felhasznalo-urlap-modal';

describe('FelhasznaloUrlapModal', () => {
  let component: FelhasznaloUrlapModal;
  let fixture: ComponentFixture<FelhasznaloUrlapModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FelhasznaloUrlapModal],
      providers: [provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(FelhasznaloUrlapModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('rejects a name shorter than two trimmed characters', () => {
    component.form.controls.name.setValue(' A ');
    expect(component.form.controls.name.invalid).toBe(true);
  });

  it('rejects an invalid email address', () => {
    component.form.controls.email.setValue('not-an-email');
    expect(component.form.controls.email.invalid).toBe(true);
  });
});
