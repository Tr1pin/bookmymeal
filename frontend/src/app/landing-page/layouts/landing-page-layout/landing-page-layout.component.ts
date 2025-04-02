import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FrontNavbarComponent } from "../../components/front-navbar/front-navbar.component";

@Component({
  selector: 'app-landing-page-layout',
  imports: [RouterOutlet, FrontNavbarComponent],
  templateUrl: './landing-page-layout.component.html'
})
export class LandingPageLayoutComponent { }
