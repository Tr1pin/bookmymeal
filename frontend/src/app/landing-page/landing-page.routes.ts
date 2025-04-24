import { Routes } from "@angular/router";
import { LandingPageLayoutComponent } from "./layouts/landing-page-layout/landing-page-layout.component";
import { LoginComponent } from "../auth/login/login.component";
import { RegisterComponent } from "../auth/register/register.component";
import { HomeComponent } from "./layouts/home/home.component";
import { CartaComponent } from "./layouts/carta/carta.component";
import { ReservasComponent } from "./layouts/reservas/reservas.component";


export const landingPageRoutes: Routes = [
   {
    path: '',
    component: LandingPageLayoutComponent,
    children: [
         {
            path: '',
            component: HomeComponent
         },
         {
            path: 'login',
            component: LoginComponent
         },
         {
            path: 'register',
            component: RegisterComponent
         },
         {
            path: 'carta',
            component: CartaComponent
         },
         {
            path: 'reservas',
            component: ReservasComponent
         },
    ]
   },
   {
      path: '**',
      redirectTo: ''
   }
] 

export default landingPageRoutes;