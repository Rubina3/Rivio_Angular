import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, AdminSummary } from '../services/dashboard.service';

// PrimeNG Imports
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SkeletonModule, ButtonModule, ProgressBarModule],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  // State Signals
  summary = signal<AdminSummary | null>(null);
  isLoading = signal(true);
  hasError = signal(false);
  isSystemHealthy = signal(true);

  ngOnInit() {
    this.fetchDashboardData();
    this.checkSystemHealth();
  }

  fetchDashboardData() {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.dashboardService.getAdminSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard KPIs', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  checkSystemHealth() {
    this.dashboardService.getSystemHealth().subscribe({
      next: () => this.isSystemHealthy.set(true),
      error: () => this.isSystemHealthy.set(false)
    });
  }
}