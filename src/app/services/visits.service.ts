// src/app/services/visits.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../core/api-response';

export interface Visit {
  id: number;
  scheduledAt: string; // ISO date-time
  status: string;
  notes?: string;
  examplep: {
    id: number;
    firstName: string;
    lastName: string;
  };
  exampled: {
    id: number;
    fullName: string;
    role: string;
    // email not in UserDto, but entity has; we’ll just use fullName/role
  } | any;
}

export interface VisitCreatePayload {
  examplepId: number;
  exampledId: number;
  scheduledAt: string; // ISO
  status: string;
  notes?: string;
}
@Injectable({ providedIn: 'root' })
export class VisitsService {
  private baseUrl = `${environment.apiUrl}/visits`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Visit[]> {
    return this.http
      .get<ApiResponse<Visit[]>>(this.baseUrl)
      .pipe(map(res => res.data));
  }

  create(payload: VisitCreatePayload): Observable<Visit> {
    return this.http
      .post<ApiResponse<Visit>>(this.baseUrl, payload)
      .pipe(map(res => res.data));
  }
}