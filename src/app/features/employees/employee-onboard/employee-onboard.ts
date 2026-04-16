import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators'; // <-- Import switchMap

import { EmployeeService } from '../services/employee.service';
import { CompanyService, Department, Designation, Location } from '../../company/services/company.service';
import { UserService, Role } from '../../auth-users/services/user.service'; // <-- Import User Service

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password'; // <-- Add Password Module

@Component({
  selector: 'app-employee-onboard',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, DialogModule, 
    InputTextModule, SelectModule, DatePickerModule, PasswordModule
  ],
  templateUrl: './employee-onboard.html'
})
export class EmployeeOnboardComponent {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private companyService = inject(CompanyService);
  private userService = inject(UserService);

  @Output() employeeAdded = new EventEmitter<void>();

  isVisible = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  // Dropdown Data Signals
  roles = signal<Role[]>([]);
  departments = signal<Department[]>([]);
  allDesignations = signal<Designation[]>([]);
  filteredDesignations = signal<Designation[]>([]);
  locations = signal<Location[]>([]);
  managers = signal<{label: string, value: number}[]>([]);
  
  employmentTypes = [
    { label: 'Full Time', value: 'FULL_TIME' },
    { label: 'Part Time', value: 'PART_TIME' },
    { label: 'Contract', value: 'CONTRACT' }
  ];

  onboardForm = this.fb.nonNullable.group({
    // User Account Credentials
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    roleId: [null as number | null, Validators.required],
    
    // Employee Details
    employeeCode: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    departmentId: [null as number | null, Validators.required],
    designationId: [null as number | null, Validators.required],
    locationId: [null as number | null, Validators.required],
    joiningDate: [new Date(), Validators.required],
    employmentType: ['FULL_TIME', Validators.required],
    reportsToProfileId: [null as number | null] 
  });

  constructor() {
    this.onboardForm.controls.departmentId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((selectedDeptId) => {
        if (selectedDeptId) {
          const matches = this.allDesignations().filter(d => d.departmentId === selectedDeptId);
          this.filteredDesignations.set(matches);
        } else {
          this.filteredDesignations.set([]);
        }
        this.onboardForm.controls.designationId.setValue(null);
      });
  }

  open() {
    this.onboardForm.reset({ joiningDate: new Date(), employmentType: 'FULL_TIME' });
    this.errorMessage.set(null);
    this.isVisible.set(true);
    this.loadDropdownData();
  }

  close() {
    this.isVisible.set(false);
  }

  loadDropdownData() {
    this.userService.getRoles().subscribe(res => this.roles.set(res));
    this.companyService.getDepartments().subscribe(res => this.departments.set(res));
    this.companyService.getLocations().subscribe(res => this.locations.set(res));
    
    this.companyService.getDesignations().subscribe(res => {
      this.allDesignations.set(res);
      this.filteredDesignations.set([]); 
    });

    this.employeeService.getEmployees(0, 1000).subscribe(res => {
      const mappedManagers = res.content.map(emp => ({
        label: `${emp.firstName} ${emp.lastName} (${emp.email})`,
        value: emp.id
      }));
      this.managers.set(mappedManagers);
    });
  }

  onSubmit() {
    if (this.onboardForm.invalid) {
      this.onboardForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const rawForm = this.onboardForm.getRawValue();

    // 1. Prepare User Payload
    const userPayload = {
      email: rawForm.email,
      password: rawForm.password,
      roleId: Number(rawForm.roleId)
    };

    // 2. Chain the API Calls using switchMap
    this.userService.createUser(userPayload).pipe(
      switchMap((createdUser) => {
        
        // 3. Prepare Employee Payload using the new User ID
        const employeePayload = {
          userId: createdUser.id, // Grab the ID from API #1
          employeeCode: rawForm.employeeCode,
          firstName: rawForm.firstName,
          lastName: rawForm.lastName,
          departmentId: rawForm.departmentId,
          designationId: rawForm.designationId,
          locationId: rawForm.locationId,
          joiningDate: rawForm.joiningDate.toISOString().split('T')[0], 
          employmentType: rawForm.employmentType,
          reportsToProfileId: rawForm.reportsToProfileId || null
        };

        // 4. Trigger API #2
        return this.employeeService.createEmployee(employeePayload);
      })
    ).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isVisible.set(false);
        this.employeeAdded.emit(); // Refresh the table
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to complete the onboarding process. Please check your data.');
      }
    });
  }
}