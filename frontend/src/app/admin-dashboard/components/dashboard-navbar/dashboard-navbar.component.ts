import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'dashboard-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dashboard-navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardNavbarComponent { }
