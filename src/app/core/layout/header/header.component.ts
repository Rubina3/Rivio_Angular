import { Component, inject } from '@angular/core';
import { AuthState } from '../../state/auth.state';
import { AuthService } from '../../auth/auth.service';
import { LayoutState } from '../../state/layout.state'; // Inject Layout State

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  authState = inject(AuthState);
  layoutState = inject(LayoutState);
  private authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}