// src/app/pages/root-redirect/root-redirect.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-root-redirect',
  template: `<div class="min-h-screen flex items-center justify-center text-sm text-slate-500">
               Redirecting…
             </div>`
})
export class RootRedirectComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/app/dashboard']);
    } else {
      this.router.navigate(['/landing']);
    }
  }
}