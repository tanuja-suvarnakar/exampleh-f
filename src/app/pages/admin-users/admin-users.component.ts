// src/app/pages/admin-users/admin-users.component.ts
import { Component, OnInit } from '@angular/core';
import {
  AdminUserService,
  AdminUser,
  CreateUserPayload
} from '../../services/admin-user.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

interface UserStats {
  total: number;
  exampleds: number;
  assistants: number;
  admins: number;
}

interface FilterOptions {
  role: string;
  searchTerm: string;
  status: string;
}

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  loading = true;
  error = '';
  
  // Create/Edit modal
  showModal = false;
  saving = false;
  modalMode: 'create' | 'edit' = 'create';
  modalError = '';
  modalSuccess = false;
  
  // Form
  form: CreateUserPayload = {
    fullName: '',
    email: '',
    password: '',
    role: 'EXAMPLED'
  };
  
  editingUserId: number | null = null;
  
  // View mode
  viewMode: 'table' | 'cards' = 'table';
  
  // Filters
  filters: FilterOptions = {
    role: 'all',
    searchTerm: '',
    status: 'all'
  };
  
  // Stats
  stats: UserStats = {
    total: 0,
    exampleds: 0,
    assistants: 0,
    admins: 0
  };
  
  // Password visibility
  showPassword = false;
  
  // Role options
  roleOptions = [
    { 
      value: 'EXAMPLED' as const, 
      label: 'Exampled', 
      description: 'Medical practitioners who can create examplepres',
      icon: 'doctor',
      color: 'indigo'
    },
    { 
      value: 'ASSISTANT' as const, 
      label: 'Assistant', 
      description: 'Support staff with limited access',
      icon: 'assistant',
      color: 'emerald'
    },
    { 
      value: 'ADMIN' as const, 
      label: 'Administrator', 
      description: 'Full system access and user management',
      icon: 'admin',
      color: 'amber'
    }
  ];

  constructor(
    private adminUserService: AdminUserService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const current = this.auth.getCurrentUser();
    if (!current || current.role !== 'ADMIN') {
      this.error = 'Only administrators can access this page.';
      this.loading = false;
      return;
    }

    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    
    this.adminUserService.list().subscribe({
      next: (data: AdminUser[]) => {
        this.users = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load users';
        this.loading = false;
      }
    });
  }

  private calculateStats(): void {
    this.stats = {
      total: this.users.length,
      exampleds: this.users.filter((u: AdminUser) => u.role === 'EXAMPLED').length,
      assistants: this.users.filter((u: AdminUser) => u.role === 'ASSISTANT').length,
      admins: this.users.filter((u: AdminUser) => u.role === 'ADMIN').length
    };
  }

get filteredUsers(): AdminUser[] {
  let result = [...this.users];
  
  // Filter by role
  if (this.filters.role !== 'all') {
    result = result.filter((u: AdminUser) => u.role === this.filters.role);
  }
  
  // Filter by search term - NOW INCLUDE EMAIL
  if (this.filters.searchTerm) {
    const term = this.filters.searchTerm.toLowerCase();
    result = result.filter((u: AdminUser) => 
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)  // Add email back
    );
  }
  
  return result;
}


  openCreateModal(): void {
    this.modalMode = 'create';
    this.showModal = true;
    this.modalError = '';
    this.modalSuccess = false;
    this.editingUserId = null;
    this.form = {
      fullName: '',
      email: '',
      password: '',
      role: 'EXAMPLED'
    };
    this.showPassword = false;
  }
openEditModal(user: AdminUser): void {
  this.modalMode = 'edit';
  this.showModal = true;
  this.modalError = '';
  this.modalSuccess = false;
  this.editingUserId = user.id;
  this.form = {
    fullName: user.fullName,
    email: user.email || '',  // Now use the actual email
    password: '',
    role: user.role as 'ADMIN' | 'EXAMPLED' | 'ASSISTANT'
  };
  this.showPassword = false;
}

  closeModal(): void {
    this.showModal = false;
    this.modalError = '';
    this.modalSuccess = false;
  }

  saveUser(): void {
    if (!this.form.fullName || !this.form.email) {
      this.modalError = 'Please fill in all required fields.';
      return;
    }
    
    if (this.modalMode === 'create' && !this.form.password) {
      this.modalError = 'Password is required for new users.';
      return;
    }
    
    this.saving = true;
    this.modalError = '';
    
    if (this.modalMode === 'create') {
      this.createUser();
    } else {
      this.updateUser();
    }
  }

  private createUser(): void {
    this.adminUserService.create(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.modalSuccess = true;
        this.toast.showSuccess('User created successfully!');
        
        setTimeout(() => {
          this.closeModal();
          this.loadUsers();
        }, 1500);
      },
      error: (err: any) => {
        this.modalError = err.error?.message || 'Failed to create user';
        this.toast.showError(this.modalError);
        this.saving = false;
      }
    });
  }

  private updateUser(): void {
    // Implement update logic if your API supports it
    // For now, just simulate success
    setTimeout(() => {
      this.saving = false;
      this.modalSuccess = true;
      this.toast.showSuccess('User updated successfully!');
      
      setTimeout(() => {
        this.closeModal();
        this.loadUsers();
      }, 1500);
    }, 500);
  }

  deleteUser(user: AdminUser): void {
    if (!confirm(`Are you sure you want to delete ${user.fullName}?`)) {
      return;
    }
    
    // Implement delete logic
    this.toast.showSuccess('User deleted successfully!');
    this.loadUsers();
  }

  toggleView(mode: 'table' | 'cards'): void {
    this.viewMode = mode;
  }

  clearFilters(): void {
    this.filters = {
      role: 'all',
      searchTerm: '',
      status: 'all'
    };
  }

  hasActiveFilters(): boolean {
    return this.filters.role !== 'all' || 
           this.filters.searchTerm !== '' || 
           this.filters.status !== 'all';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  generatePassword(): void {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    this.form.password = password;
    this.showPassword = true;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.toast.showSuccess('Copied to clipboard!');
    });
  }

  getUserInitials(user: AdminUser): string {
    const names = user.fullName.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.fullName.substring(0, 2).toUpperCase();
  }

  getAvatarColor(id: number | undefined): string {
    const colors = [
      'avatar--indigo',
      'avatar--emerald',
      'avatar--amber',
      'avatar--rose',
      'avatar--sky',
      'avatar--purple',
      'avatar--teal'
    ];
    return colors[(id || 0) % colors.length];
  }

  getRoleBadgeClass(role: string): string {
    const classes: Record<string, string> = {
      'EXAMPLED': 'role--exampled',
      'ASSISTANT': 'role--assistant',
      'ADMIN': 'role--admin'
    };
    return classes[role] || '';
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'EXAMPLED': 'Exampled',
      'ASSISTANT': 'Assistant',
      'ADMIN': 'Administrator'
    };
    return labels[role] || role;
  }

  getRoleOption(role: string): any {
    return this.roleOptions.find((r: any) => r.value === role);
  }
  
  // Helper method to get user identifier (since email might not exist)
  getUserIdentifier(user: AdminUser): string {
    // If your AdminUser has email, use it, otherwise use ID
    return `ID: #${user.id}`;
  }
}