import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { StoreManagersComponent } from './admin/store-managers/store-managers.component';
import { StoreRepresentativesComponent } from './admin/store-representatives/store-representatives.component';
import { StoresComponent } from './admin/stores/stores.component';
import { SmDashboardComponent } from './sm/dashboard/sm-dashboard.component';
import { SrDashboardComponent } from './sr/dashboard/sr-dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'stores',
        component: StoresComponent,
      },
      {
        path: 'store-representatives',
        component: StoreRepresentativesComponent,
      },
      {
        path: 'store-managers',
        component: StoreManagersComponent,
      },
      {
        path: '',
        redirectTo: 'stores',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'sr/dashboard',
    component: SrDashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'sm/dashboard',
    component: SmDashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/admin/stores',
    pathMatch: 'full',
  },
];
