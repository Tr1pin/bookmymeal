import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gracias-reserva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gracias-reserva.component.html',
  styleUrls: ['./gracias-reserva.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraciasReservaComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private timeoutId?: number;
  
  countdown = 6;
  private countdownInterval?: number;

  ngOnInit() {
    // Iniciar countdown visual
    this.countdownInterval = window.setInterval(() => {
      this.countdown--;
      this.cdr.detectChanges(); // Forzar detección de cambios para actualizar UI
      if (this.countdown <= 0) {
        // Solo limpiar el interval del countdown, no el timeout de navegación
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = undefined;
        }
      }
    }, 1000);

    // Navegar a home después de 5 segundos
    this.timeoutId = window.setTimeout(() => {
      this.router.navigate(['/']);
    }, 5000);
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  private clearTimers() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  // Permitir navegación manual
  goToHome() {
    this.clearTimers();
    this.router.navigate(['/']);
  }
} 