import { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { adminGuard } from './auth/guards/admin.guard';
import { authGuard } from './auth/guards/auth.guard';
import { Codigo2faComponent } from './auth/components/codigo-2fa/codigo-2fa.component';
import { login2faGuard } from './auth/guards/login2fa.guard';

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
        path: 'login2fa/:email',
        component: Codigo2faComponent,
        canActivate: [login2faGuard]
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
