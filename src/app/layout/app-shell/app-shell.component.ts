// src/app/layout/app-shell/app-shell.component.ts
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
  roles?: string[];
  exact?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface Notification {
  id: number;
  title: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss']
})
export class AppShellComponent implements OnDestroy {
  user = this.auth.getCurrentUser();
  sidebarCollapsed = false;
  showUserMenu = false;
  showNotifications = false;
  currentTime = new Date();
  private timeInterval: any;

  // ORIGINAL ROUTES RESTORED
  navigation: NavGroup[] = [
    {
      title: 'Overview',
      items: [
        { 
          label: 'Dashboard', 
          route: '/app/dashboard', 
          icon: 'dashboard',
          exact: true 
        }
      ]
    },
    {
      title: 'Examplep Data',
      items: [
        { 
          label: 'Exampleps', 
          route: '/app/exampleps', 
          icon: 'patients' 
        },
        { 
          label: 'Visits', 
          route: '/app/visits', 
          icon: 'calendar' 
        },
        { 
          label: 'Examplepres', 
          route: '/app/prescriptions', 
          icon: 'prescription' 
        }
      ]
    },
    {
      title: 'Administration',
      items: [
        { 
          label: 'Users', 
          route: '/app/admin/users', 
          icon: 'users', 
          roles: ['ADMIN'] 
        }
      ]
    }
  ];

  notifications: Notification[] = [
    { id: 1, title: 'New appointment request', time: '5 min ago', read: false },
    { id: 2, title: 'Examplep record updated', time: '1 hour ago', read: false },
    { id: 3, title: 'System maintenance scheduled', time: '3 hours ago', read: true }
  ];

  constructor(private auth: AuthService, private router: Router) {
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  closeDropdowns(): void {
    this.showUserMenu = false;
    this.showNotifications = false;
  }

  canAccess(item: NavItem): boolean {
    if (!item.roles) return true;
    return item.roles.includes(this.user?.role || '');
  }

  getUnreadCount(): number {
    return this.notifications.filter((n: Notification) => !n.read).length;
  }

  getUserInitials(): string {
    const name: string = this.user?.fullName || 'U';
    return name
      .split(' ')
      .map((namePart: string) => namePart[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}