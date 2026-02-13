// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RootRedirectComponent } from './pages/root-redirect/root-redirect.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ExamplepListComponent } from './pages/examplep-list/examplep-list.component';
import { ExamplepDetailComponent } from './pages/examplep-detail/examplep-detail.component';
import { ExamplepFormComponent } from './pages/examplep-form/examplep-form.component';
import { ProfileComponent } from './pages/profile/profile.component'; // ADD
import { SettingsComponent } from './pages/settings/settings.component'; // ADD
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { AuthGuard } from './core/auth.guard';
import { PrescriptionsComponent } from './pages/prescriptions/prescriptions.component';
import { VisitsComponent } from './pages/visits/visits.component';

const routes: Routes = [
  { path: '', component: RootRedirectComponent },
  { path: 'landing', component: LandingComponent },
  { path: 'login', component: LoginComponent },

  {
    path: 'app',
    component: AppShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'exampleps', component: ExamplepListComponent },
      { path: 'exampleps/new', component: ExamplepFormComponent },
      { path: 'exampleps/:id/edit', component: ExamplepFormComponent },
      { path: 'exampleps/:id', component: ExamplepDetailComponent },
      { path: 'visits', component: VisitsComponent },
      { path: 'prescriptions', component: PrescriptionsComponent },
      { path: 'profile', component: ProfileComponent }, // ADD
      { path: 'settings', component: SettingsComponent }, // ADD
      { path: 'admin/users', component: AdminUsersComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}