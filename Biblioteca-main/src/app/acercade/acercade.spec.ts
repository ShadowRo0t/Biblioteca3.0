import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Acercade } from './acercade';

describe('Acercade', () => {
  let component: Acercade;
  let fixture: ComponentFixture<Acercade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Acercade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Acercade);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
