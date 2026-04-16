import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';

export interface Department { 
  id: number; 
  name: string; 
  managerEmail: string | null;
  managerUserId: number | null;
}

export interface Designation { 
  id: number; 
  title: string; // <-- Changed from name to title
  departmentId: number; 
  departmentName: string;
}

export interface Location { 
  id: number; 
  name: string; 
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private api = inject(BaseApiService);

  getDepartments(): Observable<Department[]> {
    return this.api.get<Department[]>('/departments');
  }

  getDesignations(): Observable<Designation[]> {
    return this.api.get<Designation[]>('/designations');
  }

  getLocations(): Observable<Location[]> {
    return this.api.get<Location[]>('/locations');
  }
}