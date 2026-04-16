import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';

export interface Role { 
  id: number; 
  name: string; 
}

export interface UserCreatePayload { 
  email: string; 
  password: string; 
  roleId: number; 
}

export interface UserResponse { 
  id: number; 
  email: string; 
  roleName: string; 
  status: string; 
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api = inject(BaseApiService);

  getRoles(): Observable<Role[]> {
    return this.api.get<Role[]>('/roles');
  }

  createUser(payload: UserCreatePayload): Observable<UserResponse> {
    return this.api.post<UserResponse>('/users', payload);
  }
  resetPassword(userId: number, payload: { newPassword: string }): Observable<any> {
    // Note: ensure your BaseApiService supports PUT, or change to POST if your backend uses POST
    return this.api.post(`/users/${userId}/reset-password`, payload);
  }
}