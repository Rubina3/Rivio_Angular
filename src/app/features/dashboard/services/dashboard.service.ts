import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/services/base-api.service';

export interface AdminSummary {
  totalActiveEmployees: number;
  totalOpenJobs: number;
  pendingLeaveRequests: number;
  totalCandidates: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = inject(BaseApiService);

  getAdminSummary(): Observable<AdminSummary> {
    return this.api.get<AdminSummary>('/dashboard/admin-summary');
  }

  getSystemHealth(): Observable<any> {
    // We don't map to a specific interface here, just getting the raw data
    return this.api.get<any>('/health'); 
  }
}