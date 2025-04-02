import { Routes } from "@angular/router";
import { LandingPageLayoutComponent } from "./layouts/landing-page-layout/landing-page-layout.component";


export const landingPageRoutes: Routes = [
   {
    path: '',
    component: LandingPageLayoutComponent,
   }
] 

export default landingPageRoutes;