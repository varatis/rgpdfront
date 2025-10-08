import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
 {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'clients',
        loadChildren: () => import('./features/clients/clients-module').then(m => m.ClientsModule)
      },
      {
        path: 'administrators',
        loadChildren: () => import('./features/administrators/administrators-module').then(m => m.AdministratorsModule)
      },
      {
        path: 'preconisations',
        loadChildren: () => import('./features/preconisations/preconisations-module').then(m => m.PreconisationsModule)
      },
      {
        path: '',
        redirectTo: 'clients',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'auth'
  }

  
];