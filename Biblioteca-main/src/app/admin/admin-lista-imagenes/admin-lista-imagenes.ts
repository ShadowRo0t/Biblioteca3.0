import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Imagen, ImagenService } from '../../services/imagen.service';

@Component({
  selector: 'app-admin-lista-imagenes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-lista-imagenes.html',
})
export class AdminListaImagenesComponent implements OnInit {
  imagenes$!: Observable<Imagen[]>;

  constructor(private imagenSrv: ImagenService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.imagenes$ = this.imagenSrv.getImagenes();
  }

  // ✅ trackBy que usa tu *ngFor
  trackId = (_index: number, it: Imagen) => it.id;

  // ✅ handler para (error) en <img>
  imgError(e: Event) {
    const el = e.target as HTMLImageElement;
    // Fallback inline (no depende de assets)
    el.src =
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="90">
           <rect width="100%" height="100%" fill="#eee"/>
           <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
                 font-size="12" fill="#999">no image</text>
         </svg>`
      );
  }
}
