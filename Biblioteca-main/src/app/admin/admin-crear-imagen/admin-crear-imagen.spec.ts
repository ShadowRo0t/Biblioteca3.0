import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCrearImagen } from './admin-crear-imagen';

describe('AdminCrearImagen', () => {
  let component: AdminCrearImagen;
  let fixture: ComponentFixture<AdminCrearImagen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCrearImagen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCrearImagen);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
