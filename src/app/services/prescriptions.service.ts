import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../core/api-response';

export interface Prescription {
  id: number;
  medication: string;
  dosage: string;
  instructions: string;
  issuedAt: string; // ISO date-time
  examplep: {
    id: number;
    firstName: string;
    lastName: string;
  };
  exampled: {
    id: number;
    fullName: string;
    role: string;
  } | any;
}

export interface CreatePrescriptionPayload {
  examplepId: number;
  exampledId: number;
  medication: string;
  dosage: string;
  instructions: string;
}

@Injectable({ providedIn: 'root' })
export class PrescriptionsService {
  private baseUrl = `${environment.apiUrl}/prescriptions`;

  constructor(private http: HttpClient) {}

  getAll(filter?: { from?: string; to?: string }): Observable<Prescription[]> {
    let params = new HttpParams();
    if (filter?.from) {
      params = params.set('from', filter.from);
    }
    if (filter?.to) {
      params = params.set('to', filter.to);
    }

    return this.http
      .get<ApiResponse<Prescription[]>>(this.baseUrl, { params })
      .pipe(map(res => res.data));
  }

  getAllForExamplep(examplepId: number): Observable<Prescription[]> {
    return this.http
      .get<ApiResponse<Prescription[]>>(`${this.baseUrl}/examplep/${examplepId}`)
      .pipe(map(res => res.data));
  }

  createPrescription(payload: CreatePrescriptionPayload): Observable<Prescription> {
    return this.http
      .post<ApiResponse<Prescription>>(this.baseUrl, payload)
      .pipe(map(res => res.data));
  }

  downloadPrescription(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }
}