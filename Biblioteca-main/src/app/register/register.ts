import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], //  usamos ReactiveFormsModule
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  //  Validador personalizado para contraseñas iguales
  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.form.invalid) return;

    const { name, email, password } = this.form.value;
    this.authService.register({ name, email, password }).subscribe({
      next: () => {
        alert(' Cuenta creada con éxito');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        alert(' Error al registrar: ' + err.error.message);
      }
    });
  }
}
