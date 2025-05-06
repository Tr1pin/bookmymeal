import { Routes } from "@angular/router";
import { AdminDasboardLayoutComponent } from "./layouts/admin-dasboard-layout/admin-dasboard-layout.component";
import { DashboardHomeComponent } from "./components/dashboard-home/dashboard-home.component";
import { ReservasComponent } from "../landing-page/layouts/reservas/reservas.component";
import { AdminOrdersComponent } from "./components/admin-orders/admin-orders.component";
import { AdminProductsComponent } from "./components/admin-products/admin-products.component";
import { AdminReservationsComponent } from "./components/admin-reservations/admin-reservations.component";

export const adminDashboardRoutes: Routes = [
   {
    path: '',
    component: AdminDasboardLayoutComponent,
    children: [
      {
         path: '',
         component: DashboardHomeComponent
      } ,
      {
         path: 'reservas',
         component: AdminReservationsComponent
      },
      {
         path: 'pedidos',
         component: AdminOrdersComponent
      },
      {
         path: 'productos',
         component: AdminProductsComponent
      }  
    ]
   },
] 

export default adminDashboardRoutes;