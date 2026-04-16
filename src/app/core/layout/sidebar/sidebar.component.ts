import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LayoutState } from '../../state/layout.state';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  host: {
    // This is the magic line that fixes the height bug!
    class: 'h-full block flex-shrink-0 z-50' 
  }
})
export class SidebarComponent {
  layoutState = inject(LayoutState);

  navItems = [
    { label: 'Dashboard', icon: 'pi-home', route: '/dashboard' },
    { label: 'Employees', icon: 'pi-users', route: '/employees' },
    { label: 'Attendance', icon: 'pi-calendar-clock', route: '/attendance' },
    { label: 'Leave', icon: 'pi-calendar-minus', route: '/leave' },
    { label: 'Payroll', icon: 'pi-money-bill', route: '/payroll' },
    { label: 'Recruitment', icon: 'pi-briefcase', route: '/ats' },
    { label: 'Company', icon: 'pi-building', route: '/company' }
  ];
}