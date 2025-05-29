import { Routes } from "@angular/router";
import { LandingPageLayoutComponent } from "./layouts/landing-page-layout/landing-page-layout.component";
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
            path: 'carta',
            component: CartaComponent
         },
         {
            path: 'reservas',
            children: [
               {
                  path: '',
                  component: ReservasComponent
               },
               {
                  path: 'detalles',
                  component: ReservasComponent
               }
            ]
         },
    ]
   },
] 

export default landingPageRoutes;