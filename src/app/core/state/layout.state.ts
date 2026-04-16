import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutState {
  isSidebarCollapsed = signal(false); // For Desktop
  isMobileSidebarOpen = signal(false); // For Mobile

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen.update(v => !v);
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen.set(false);
  }
}