import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EmployeeService, BasicInfoUpdatePayload, JobDetailsUpdatePayload, LeaveBalance } from '../services/employee.service';
import { CompanyService, Department, Designation, Location } from '../../company/services/company.service';
import { UserService } from '../../auth-users/services/user.service';

// PrimeNG
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule, SkeletonModule, 
    DialogModule, InputTextModule, SelectModule, PasswordModule, DatePickerModule
  ],
  templateUrl: './employee-profile.component.html'
})
export class EmployeeProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);

  employee = signal<any>(null);
  leaveBalances = signal<LeaveBalance[]>([]);
  
  isLoading = signal(true);
  hasError = signal(false);
  activeTab = signal<'OVERVIEW' | 'ATTENDANCE' | 'PAYROLL'>('OVERVIEW');
  isSubmitting = signal(false);

  // Modals State
  isBasicInfoModalOpen = signal(false);
  isJobDetailsModalOpen = signal(false);
  isPasswordModalOpen = signal(false);
  isTerminateModalOpen = signal(false);

  // Dropdown Data
  departments = signal<Department[]>([]);
  allDesignations = signal<Designation[]>([]);
  filteredDesignations = signal<Designation[]>([]);
  locations = signal<Location[]>([]);
  managers = signal<{label: string, value: number}[]>([]);

  // Forms
  passwordForm = this.fb.nonNullable.group({ newPassword: ['', [Validators.required, Validators.minLength(6)]] });
  basicInfoForm = this.fb.nonNullable.group({ phoneNo: [''], bankAccount: [''] });
  terminateForm = this.fb.nonNullable.group({ exitDate: [new Date(), Validators.required] });
  
  jobDetailsForm = this.fb.nonNullable.group({
    departmentId: [null as number | null, Validators.required],
    designationId: [null as number | null, Validators.required],
    locationId: [null as number | null, Validators.required],
    reportsToProfileId: [null as number | null]
  });

  constructor() {
    // Cascade designations on department change
    this.jobDetailsForm.controls.departmentId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((deptId) => {
        if (deptId) {
          const matches = this.allDesignations().filter(d => d.departmentId === deptId);
          this.filteredDesignations.set(matches);
        } else {
          this.filteredDesignations.set([]);
        }
      });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchEmployeeDetails(Number(id));
      this.loadDropdownData();
    } else {
      this.hasError.set(true);
      this.isLoading.set(false);
    }
  }

  fetchEmployeeDetails(id: number) {
    this.isLoading.set(true);
    this.employeeService.getEmployeeById(id).subscribe({
      next: (data) => {
        this.employee.set(data);
        this.fetchLeaveBalances(data.id);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  fetchLeaveBalances(id: number) {
    this.employeeService.getLeaveBalances(id).subscribe({
      next: (data) => this.leaveBalances.set(data),
      error: (err) => console.error('Failed to load leaves', err)
    });
  }

  loadDropdownData() {
    this.companyService.getDepartments().subscribe(res => this.departments.set(res));
    this.companyService.getLocations().subscribe(res => this.locations.set(res));
    this.companyService.getDesignations().subscribe(res => this.allDesignations.set(res));
    this.employeeService.getEmployees(0, 1000).subscribe(res => {
      this.managers.set(res.content.map((emp: any) => ({ label: `${emp.firstName} ${emp.lastName}`, value: emp.id })));
    });
  }

  // --- SUBMIT BASIC INFO ---
  openBasicInfoModal() {
    const emp = this.employee();
    this.basicInfoForm.patchValue({ phoneNo: emp?.phoneNo || '', bankAccount: emp?.bankAccount || '' });
    this.isBasicInfoModalOpen.set(true);
  }

  submitBasicInfo() {
    this.isSubmitting.set(true);
    const payload: BasicInfoUpdatePayload = this.basicInfoForm.getRawValue();
    this.employeeService.updateBasicInfo(this.employee()!.id, payload).subscribe({
      next: () => { this.refreshAndClose(this.isBasicInfoModalOpen); },
      error: () => this.isSubmitting.set(false)
    });
  }

  // --- SUBMIT JOB DETAILS ---
  openJobDetailsModal() {
    const emp = this.employee();
    this.jobDetailsForm.patchValue({
      departmentId: emp?.departmentId || null,
      designationId: emp?.designationId || null,
      locationId: emp?.locationId || null,
      reportsToProfileId: emp?.managerId || null
    });
    this.isJobDetailsModalOpen.set(true);
  }

  submitJobDetails() {
    if (this.jobDetailsForm.invalid) return;
    this.isSubmitting.set(true);
    const payload: JobDetailsUpdatePayload = this.jobDetailsForm.getRawValue();
    this.employeeService.updateJobDetails(this.employee()!.id, payload).subscribe({
      next: () => { this.refreshAndClose(this.isJobDetailsModalOpen); },
      error: () => this.isSubmitting.set(false)
    });
  }

  // --- TERMINATE EMPLOYEE ---
  openTerminateModal() { this.isTerminateModalOpen.set(true); }

  submitTerminate() {
    if (this.terminateForm.invalid) return;
    this.isSubmitting.set(true);
    const exitDate = this.terminateForm.getRawValue().exitDate.toISOString().split('T')[0];
    this.employeeService.updateStatus(this.employee()!.id, { status: 'TERMINATED', exitDate }).subscribe({
      next: () => { this.refreshAndClose(this.isTerminateModalOpen); },
      error: () => this.isSubmitting.set(false)
    });
  }

  // --- RESET PASSWORD ---
  openPasswordModal() { this.passwordForm.reset(); this.isPasswordModalOpen.set(true); }

  submitPasswordReset() {
    if (this.passwordForm.invalid) return;
    this.isSubmitting.set(true);
    this.userService.resetPassword(this.employee()!.userId, this.passwordForm.getRawValue()).subscribe({
      next: () => { this.isPasswordModalOpen.set(false); this.isSubmitting.set(false); alert('Password reset successfully!'); },
      error: () => this.isSubmitting.set(false)
    });
  }

  // Helper
  private refreshAndClose(modalSignal: any) {
    this.fetchEmployeeDetails(this.employee()!.id);
    modalSignal.set(false);
    this.isSubmitting.set(false);
  }

  getAvatarClass(name: string | undefined) { return name ? ['bg-blue-100 text-blue-800', 'bg-teal-100 text-teal-800', 'bg-indigo-100 text-indigo-800', 'bg-violet-100 text-violet-800'][name.charCodeAt(0) % 4] : 'bg-gray-200 text-gray-800'; }
  getStatusClasses(status: string | undefined) { return status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200' : status === 'TERMINATED' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-gray-100 text-gray-800 border-gray-200'; }
}