// src/app/core/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiResponse } from './api-response';

export interface LoginData {
  token: string;
  user: {
    id: number;
    fullName: string;
    role: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private tokenKey = 'exampleh_token';
  private userKey = 'exampleh_user';

  constructor(private http: HttpClient) { }

login(email: string, password: string): Observable<LoginData> {
    return this.http
      .post<ApiResponse<LoginData>>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        map(res => res.data),
        tap(data => {
          localStorage.setItem(this.tokenKey, data.token);
          localStorage.setItem(this.userKey, JSON.stringify(data.user));
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): any | null {
    const val = localStorage.getItem(this.userKey);
    return val ? JSON.parse(val) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}