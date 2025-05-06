import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'dashboard-home',
  imports: [],
  templateUrl: './dashboard-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHomeComponent { }
