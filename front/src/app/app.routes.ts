import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin/admin-layout/admin-layout.component';
import { StoreManagersComponent } from './admin/store-managers/store-managers.component';
import { StoreRepresentativesComponent } from './admin/store-representatives/store-representatives.component';
import { StoresComponent } from './admin/stores/stores.component';

export const routes: Routes = [
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
    path: '',
    redirectTo: '/admin/stores',
    pathMatch: 'full',
  },
];
