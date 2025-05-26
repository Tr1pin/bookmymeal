import { Routes } from "@angular/router";
import { AdminDasboardLayoutComponent } from "./layouts/admin-dasboard-layout/admin-dasboard-layout.component";
import { DashboardHomeComponent } from "./components/dashboard-home/dashboard-home.component";
import { ReservasComponent } from "../landing-page/layouts/reservas/reservas.component";
import { AdminOrdersComponent } from "./components/admin-orders/admin-orders.component";
import { AdminProductsComponent } from "./components/admin-products/admin-products.component";
import { AdminReservationsComponent } from "./components/admin-reservations/admin-reservations.component";
import { CreateProductComponent } from "./components/admin-products/create-product/create-product.component";
import { UpdateProductComponent } from "./components/admin-products/update-product/update-product.component";
import { ProductDetailsComponent } from "./components/admin-products/product-details/product-details.component";

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
         children: [
            {
               path: '',
               component: AdminProductsComponent
            },
            {
               path: 'crear',
               component: CreateProductComponent
            },
            {
               path: 'actualizar/:id',
               component: UpdateProductComponent
            },
            {
               path: 'detalles/:id',
               component: ProductDetailsComponent
            }
         ]
      }  
    ]
   },
] 

export default adminDashboardRoutes;