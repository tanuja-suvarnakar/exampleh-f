// src/app/pages/login/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;
  
  // Form validation states
  emailTouched = false;
  passwordTouched = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    // Mark fields as touched
    this.emailTouched = true;
    this.passwordTouched = true;
    
    // Validate
    if (!this.isFormValid()) {
      this.error = 'Please fill in all required fields correctly.';
      return;
    }
    
    this.error = '';
    this.loading = true;
    
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/app/dashboard']);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Invalid email or password. Please try again.';
        this.loading = false;
      }
    });
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  isFormValid(): boolean {
    return this.isEmailValid() && this.password.length >= 6;
  }
  
  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
  
  getEmailError(): string {
    if (!this.emailTouched) return '';
    if (!this.email) return 'Email is required';
    if (!this.isEmailValid()) return 'Please enter a valid email';
    return '';
  }
  
  getPasswordError(): string {
    if (!this.passwordTouched) return '';
    if (!this.password) return 'Password is required';
    if (this.password.length < 6) return 'Password must be at least 6 characters';
    return '';
  }
  
  onEmailBlur(): void {
    this.emailTouched = true;
  }
  
  onPasswordBlur(): void {
    this.passwordTouched = true;
  }
}