import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../core/api-response';

export interface Examplep {
  id?: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;       // current page index
  size: number;
}

@Injectable({ providedIn: 'root' })
export class ExamplepService {
  private baseUrl = `${environment.apiUrl}/exampleps`;

  constructor(private http: HttpClient) {}

  getPaged(page: number, size: number, search?: string): Observable<Page<Examplep>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    if (search) params = params.set('search', search);

    return this.http
      .get<ApiResponse<Page<Examplep>>>(this.baseUrl, { params })
      .pipe(map(res => res.data));
  }

  // simple list for dropdowns (no pagination; you can optimize later)
  getAllSimple(): Observable<Examplep[]> {
    return this.getPaged(0, 100).pipe(map(p => p.content));
  }

  getById(id: number): Observable<Examplep> {
    return this.http
      .get<ApiResponse<Examplep>>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data));
  }
   // ADD THIS: Create new examplep
  create(examplep: Examplep): Observable<Examplep> {
    return this.http
      .post<ApiResponse<Examplep>>(this.baseUrl, examplep)
      .pipe(map(res => res.data));
  }

  // ADD THIS: Update existing examplep
  update(id: number, examplep: Examplep): Observable<Examplep> {
    return this.http
      .put<ApiResponse<Examplep>>(`${this.baseUrl}/${id}`, examplep)
      .pipe(map(res => res.data));
  }

  // ADD THIS: Delete examplep
  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data));
  }
}