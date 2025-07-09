import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (user) => {
        if (user.role === 'admin') {
          this.router.navigate(['/admin/admin-dashboard']);
        } else if (user.role === 'instructor') {
          this.router.navigate(['/instructor/dashboard']);
        } else if (user.role === 'student') {
          this.router.navigate(['/users/dashboard']);
        } else {
          this.router.navigate(['/courses']);
        }
      },
      error: err => this.errorMessage = 'Invalid email or password'
    });
  }
}
