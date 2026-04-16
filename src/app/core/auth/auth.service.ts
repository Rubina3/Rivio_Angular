import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BaseApiService } from '../services/base-api.service';
import { AuthState } from '../state/auth.state';
import { tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  userId: number;
  role: string;
  permissions: string[];
  employeeProfileId: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(BaseApiService);
  private router = inject(Router);
  private authState = inject(AuthState); // Inject the new State Manager

  // Inside your AuthService class, update the login method:
  login(credentials: { email: string; password: string }) {
    return this.api.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((response) => {
        // Now passing all required parameters
        this.authState.setSession(
          response.token, 
          response.name, 
          response.role, 
          response.userId, 
          response.employeeProfileId
        );
      })
    );
  }

  logout() {
    this.authState.clearSession();
    this.router.navigateByUrl('/login');
  }
}