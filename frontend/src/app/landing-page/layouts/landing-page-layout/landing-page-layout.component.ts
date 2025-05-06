import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FrontNavbarComponent } from "../../components/front-navbar/front-navbar.component";
import { FooterLanding } from '../../components/footer-landing/front-landing.component';

@Component({
  selector: 'app-landing-page-layout',
  imports: [RouterOutlet, FrontNavbarComponent, FooterLanding],
  templateUrl: './landing-page-layout.component.html'
})
export class LandingPageLayoutComponent { }
