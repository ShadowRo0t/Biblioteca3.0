import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  showPwd = signal(false);
  togglePwd() { this.showPwd.set(!this.showPwd()); }

  form;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({ //validarores
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit() {
    if (this.form.invalid) return;

    this.authService.login(this.form.value).subscribe({
      next: (res: any) => {
        // Laravel debe devolver { token: "...", user: {...} }
        if (res.token) {
          this.authService.saveToken(res.token); //  guardamos token
          alert(' Sesión iniciada correctamente');
          this.router.navigate(['/prestamos']); // redirigimos a Dashboard
        } else {
          alert(' No se recibió token desde el backend');
        }
      },
      error: (err) => {
        console.error(err);
        alert(' Credenciales incorrectas');
      }
    });
  }

  recuperar() {
    alert('Función "Recuperar contraseña" pendiente de implementar.');
  }

  registrarse() {
    this.router.navigate(['/register']);
  }
}
