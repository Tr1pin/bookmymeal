import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { ChangeDetectionStrategy, Component } from "@angular/core";


@Component({
  selector: 'app-home-reservation-section-component',
  imports: [ CommonModule, RouterLink],
  templateUrl: './reservation-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationSectionComponent {}