import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista.html',
  styleUrls: ['./lista.css']
})
export class Lista {
  usuarios = [
    { id: 1, rut: '11111111-1', nombres: 'Felipe', apellidos: 'Arancibia', correo: 'correofalso@gmail.com' },
    { id: 2, rut: '22222222-2', nombres: 'Juan', apellidos: 'Gómez', correo: 'juan@mail.com' },
    { id: 3, rut: '33333333-3', nombres: 'cristobal', apellidos: 'Galaz', correo: 'bocalloteamo@mail.com' },
    { id: 4, rut: '44444444-4', nombres: 'Juan', apellidos: 'rojas', correo: 'boquitalomasgrande@mail.com' },
    { id: 5, rut: '55555555-5', nombres: 'Walter', apellidos: 'Chavez', correo: 'viejaexotica33@mail.com' },
  ];
}
