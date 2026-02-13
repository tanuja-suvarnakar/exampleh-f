// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ExamplepListComponent } from './pages/examplep-list/examplep-list.component';
import { ExamplepDetailComponent } from './pages/examplep-detail/examplep-detail.component';
import { AppShellComponent } from './layout/app-shell/app-shell.component';
import { TokenInterceptor } from './core/token.interceptor';
import { AdminUsersComponent } from './pages/admin-users/admin-users.component';
import { RootRedirectComponent } from './pages/root-redirect/root-redirect.component';
import { VisitsComponent } from './pages/visits/visits.component';
import { PrescriptionsComponent } from './pages/prescriptions/prescriptions.component';
import { ToastContainerComponent } from './shared/toast-container/toast-container.component';
import { ExamplepFormComponent } from './pages/examplep-form/examplep-form.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SettingsComponent } from './pages/settings/settings.component';




@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    LoginComponent,
    DashboardComponent,
    ExamplepListComponent,
    ExamplepDetailComponent,
    AppShellComponent,
    AdminUsersComponent,
    RootRedirectComponent,
    VisitsComponent,
    PrescriptionsComponent,
    ToastContainerComponent,
    ExamplepFormComponent,
    ProfileComponent,
    SettingsComponent
    
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}