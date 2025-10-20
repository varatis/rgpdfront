import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecueilViolation } from './recueil-violation';

describe('RecueilViolation', () => {
  let component: RecueilViolation;
  let fixture: ComponentFixture<RecueilViolation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecueilViolation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecueilViolation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
