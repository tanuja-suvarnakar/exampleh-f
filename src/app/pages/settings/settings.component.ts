// src/app/pages/settings/settings.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  user: any;
  
  // Settings state
  notifications = {
    email: true,
    push: false,
    sms: false,
    newsletter: true
  };
  
  privacy = {
    profileVisible: true,
    showEmail: false,
    showPhone: false
  };
  
  appearance = {
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeZone: 'America/New_York'
  };
  
  savingSection: string | null = null;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    // Load saved settings from localStorage or API
    this.loadSettings();
  }

  loadSettings(): void {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      this.notifications = { ...this.notifications, ...settings.notifications };
      this.privacy = { ...this.privacy, ...settings.privacy };
      this.appearance = { ...this.appearance, ...settings.appearance };
    }
  }

  saveNotifications(): void {
    this.savingSection = 'notifications';
    setTimeout(() => {
      this.saveToStorage();
      this.savingSection = null;
    }, 1000);
  }

  savePrivacy(): void {
    this.savingSection = 'privacy';
    setTimeout(() => {
      this.saveToStorage();
      this.savingSection = null;
    }, 1000);
  }

  saveAppearance(): void {
    this.savingSection = 'appearance';
    setTimeout(() => {
      this.saveToStorage();
      this.savingSection = null;
    }, 1000);
  }

  private saveToStorage(): void {
    const settings = {
      notifications: this.notifications,
      privacy: this.privacy,
      appearance: this.appearance
    };
    localStorage.setItem('userSettings', JSON.stringify(settings));
  }
}