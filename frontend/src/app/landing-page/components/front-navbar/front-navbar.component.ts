import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../cart/services/cart.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'front-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './front-navbar.component.html'
})
export class FrontNavbarComponent {
  public cartService = inject(CartService);
  public authService = inject(AuthService);

  // Expose parseFloat to the template
  public parseFloat = parseFloat;

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.style.display = 'none';
    const fallbackElement = imgElement.nextElementSibling as HTMLElement;
    if (fallbackElement) {
      fallbackElement.style.display = 'flex';
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
