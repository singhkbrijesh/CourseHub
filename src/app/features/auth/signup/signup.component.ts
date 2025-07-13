import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LoadingService } from '../../../services/loading.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule, ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['student', Validators.required] // Default to student
    }, { validators: this.passwordMatchValidator });

    // Subscribe to loading service
    this.loadingService.loading$.subscribe(loading => {
      this.loading = loading;
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    
    const { name, email, password, role } = this.signupForm.value;
    
    this.authService.register({ name, email, password, role }).subscribe({
      next: (user) => {
        this.successMessage = 'Registration successful! Redirecting to login...';
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        if (error.message.includes('email')) {
          this.errorMessage = 'Email already exists. Please use a different email.';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}