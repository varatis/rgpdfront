import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompteClient } from './compte-client';

describe('CompteClient', () => {
  let component: CompteClient;
  let fixture: ComponentFixture<CompteClient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompteClient]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompteClient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
