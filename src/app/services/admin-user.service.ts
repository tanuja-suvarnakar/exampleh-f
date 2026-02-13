// src/app/services/admin-user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../core/api-response';

export interface AdminUser {
  id: number;
  fullName: string;
  role: string;
  email:string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'EXAMPLED' | 'ASSISTANT';
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private baseUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  list(): Observable<AdminUser[]> {
    return this.http
      .get<ApiResponse<AdminUser[]>>(this.baseUrl)
      .pipe(map(res => res.data));
  }

  create(payload: CreateUserPayload): Observable<AdminUser> {
    return this.http
      .post<ApiResponse<AdminUser>>(this.baseUrl, payload)
      .pipe(map(res => res.data));
  }
}