// src/app/pages/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  isEditingProfile = false;
  isChangingPassword = false;
  
  profileSaving = false;
  passwordSaving = false;
  
  profileSuccess = '';
  profileError = '';
  passwordSuccess = '';
  passwordError = '';

  constructor(
    private auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    this.initForms();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      fullName: [this.user?.fullName || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      phone: [''],
      bio: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  // Add this method to get initials
  getInitials(): string {
    if (!this.user?.fullName) return 'U';
    const names = this.user.fullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return names[0][0]?.toUpperCase() || 'U';
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (!this.isEditingProfile) {
      this.profileForm.patchValue({
        fullName: this.user?.fullName || '',
        email: this.user?.email || ''
      });
      this.profileError = '';
      this.profileSuccess = '';
    }
  }

  toggleChangePassword(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordForm.reset();
      this.passwordError = '';
      this.passwordSuccess = '';
    }
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileSaving = true;
    this.profileError = '';
    this.profileSuccess = '';

    setTimeout(() => {
      const updatedData = this.profileForm.value;
      this.user = { ...this.user, ...updatedData };
      
      this.profileSaving = false;
      this.profileSuccess = 'Profile updated successfully!';
      this.isEditingProfile = false;
      
      setTimeout(() => {
        this.profileSuccess = '';
      }, 3000);
    }, 1500);
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    // Check if passwords match
    if (this.passwordForm.value.newPassword !== this.passwordForm.value.confirmPassword) {
      this.passwordError = 'Passwords do not match';
      return;
    }

    this.passwordSaving = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    setTimeout(() => {
      this.passwordSaving = false;
      this.passwordSuccess = 'Password changed successfully!';
      this.passwordForm.reset();
      this.isChangingPassword = false;
      
      setTimeout(() => {
        this.passwordSuccess = '';
      }, 3000);
    }, 1500);
  }

  get pf() {
    return this.profileForm.controls;
  }

  get pwf() {
    return this.passwordForm.controls;
  }

  getRoleDisplay(role: string): string {
    const roleMap: Record<string, string> = {
      'ADMIN': 'Administrator',
      'EXAMPLED': 'Exampled',
      'NURSE': 'Nurse',
      'STAFF': 'Staff',
      'EXAMPLEP': 'Examplep'
    };
    return roleMap[role] || role || 'User';
  }

  getRoleColor(role: string): string {
    const colorMap: Record<string, string> = {
      'ADMIN': 'admin',
      'EXAMPLED': 'exampled',
      'NURSE': 'nurse',
      'STAFF': 'staff',
      'EXAMPLEP': 'examplep'
    };
    return colorMap[role] || 'default';
  }
}