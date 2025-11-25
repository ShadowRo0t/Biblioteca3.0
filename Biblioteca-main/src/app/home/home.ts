import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';   //  necesario para routerLink

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],         //  aquí agregamos RouterModule
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {}
