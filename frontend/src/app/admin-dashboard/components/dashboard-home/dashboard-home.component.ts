import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { AuthService, User } from '../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dashboard-home',
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHomeComponent implements OnInit {
  private authService = inject(AuthService);
  
  userProfile = signal<User | null>(null);
  isLoading = signal<boolean>(true);

  async ngOnInit() {
    try {
      const profile = await this.authService.getUserProfile();
      this.userProfile.set(profile);
    } catch (error) {
      console.error('Error al cargar perfil de usuario:', error);
      // Si hay error, usar datos básicos del token
      const currentUser = this.authService.getCurrentUser();
      this.userProfile.set(currentUser);
    } finally {
      this.isLoading.set(false);
    }
  }

  getUserDisplayName(): string {
    const profile = this.userProfile();
    return profile?.nombre || profile?.email || 'Admin';
  }
}
