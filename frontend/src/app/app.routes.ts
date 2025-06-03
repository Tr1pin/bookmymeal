import { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { adminGuard } from './auth/guards/admin.guard';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./landing-page/landing-page.routes'),
    },
    {
        path: 'admin-dashboard',
        loadChildren: () => import('./admin-dashboard/admin-dashboard.routes'),
        canActivate: [adminGuard]
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
        path: '**',
        redirectTo: ''
    },

];
