import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardNavbarComponent } from "../../components/dashboard-navbar/dashboard-navbar.component";
import { RouterOutlet } from '@angular/router'; 

@Component({
  selector: 'admin-dasboard-layout',
  imports: [DashboardNavbarComponent, RouterOutlet],
  templateUrl: './admin-dasboard-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDasboardLayoutComponent { }
