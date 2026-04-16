import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

// Matches your backend wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Generic GET request that unwraps the 'data' field
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`).pipe(
      map(response => response.data)
    );
  }

  // Generic POST request
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body).pipe(
      map(response => response.data)
    );
  }

  // Generic PUT request
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body).pipe(
      map(response => response.data)
    );
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body).pipe(
      map(response => response.data)
    );
  }

  // Generic DELETE request
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`).pipe(
      map(response => response.data)
    );
  }
}

