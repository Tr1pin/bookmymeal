import { Routes } from "@angular/router";
import { LandingPageLayoutComponent } from "./layouts/landing-page-layout/landing-page-layout.component";
import { HomeComponent } from "./layouts/home/home.component";
import { CartaComponent } from "./layouts/carta/carta.component";
import { ReservasComponent } from "./layouts/reservas/reservas.component";
import { PedidosComponent } from "./layouts/pedidos/pedidos.component";
import { DetallesReservaComponent } from "./layouts/reservas/detalles-reserva/detalles-reserva.component";
import { GraciasReservaComponent } from "./layouts/reservas/gracias-reserva/gracias-reserva.component";
import { GraciasPedidoComponent } from "./layouts/pedidos/gracias-pedido/gracias-pedido.component";
import { authGuard } from "../auth/guards/auth.guard";

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
            path: 'confirmar-pedido',
            component: PedidosComponent
         },
         {
            path: 'pedido-exitoso',
            component: GraciasPedidoComponent
         },
         {
            path: 'reservas',
            canActivate: [authGuard],
            children: [
               {
                  path: '',
                  component: ReservasComponent
               },
               {
                  path: 'detalles',
                  component: DetallesReservaComponent
               },
               {
                  path: 'gracias',
                  component: GraciasReservaComponent
               }
            ]
         },
    ]
   }
] 

export default landingPageRoutes;