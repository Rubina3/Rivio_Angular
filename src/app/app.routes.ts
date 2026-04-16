import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // Public Route
  {
    path: 'login',
    loadComponent: () => import('./features/auth-users/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard] // <-- Add the guard here
  },
  
  // Protected Routes (Wrapped in the Main Layout with Sidebar/Navbar)
  {
    path: '',
    loadComponent: () => import('./core/layout/main-layout/main-layout').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard)
      },
      {
        path: 'company',
        loadComponent: () => import('./features/company/company-layout/company-layout').then(m => m.CompanyLayout)
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/employees/employee-directory/employee-directory').then(m => m.EmployeeDirectory)
      },
      {
        path: 'leave',
        loadComponent: () => import('./features/leave/leave-dashboard/leave-dashboard').then(m => m.LeaveDashboard)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./features/attendance/attendance-tracker/attendance-tracker').then(m => m.AttendanceTracker)
      },
      {
        path: 'ats',
        loadComponent: () => import('./features/ats/job-board/job-board').then(m => m.JobBoard)
      },
      {
        path: 'payroll',
        loadComponent: () => import('./features/payroll/payroll-dashboard/payroll-dashboard').then(m => m.PayrollDashboard)
      }
    ]
  },
  
  // Fallback route
  { path: '**', redirectTo: 'dashboard' }
];