import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListaImagenes } from './admin-lista-imagenes';

describe('AdminListaImagenes', () => {
  let component: AdminListaImagenes;
  let fixture: ComponentFixture<AdminListaImagenes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminListaImagenes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminListaImagenes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
