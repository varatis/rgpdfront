import { Routes } from '@angular/router';
import { adminGuard, authGuard, clientGuard } from './core/guards/auth-guard';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { ClientLayout } from './layout/client-layout/client-layout';

/*export const routes: Routes = [
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

  
];*/

export const routes: Routes = [
  // Auth
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
  },

  // Routes ADMIN avec AdminLayout
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'clients',
        loadComponent: () => import('./features/admin/pages/clients-list/clients-list')
          .then(m => m.ClientsList)
          
      },
      {
        path: 'administrators',
        loadComponent: () => import('./features/admin/pages/administrators-list/administrators-list')
          .then(m => m.AdministratorsList)
      },
      {
        path: 'preconisations',
        loadComponent: () => import('./features/admin/pages/preconisations-management/preconisations-management')
          .then(m => m.PreconisationsManagement)
      },
      {
        path: '',
        redirectTo: 'clients',
        pathMatch: 'full'
      }
    ]
  },

  // Routes CLIENT/USER avec ClientLayout
  {
    path: 'client',
    component: ClientLayout,
    canActivate: [authGuard, clientGuard],
    children: [
      {
        path: 'compte-client',
        loadComponent: () => import('./features/client/pages/compte-client/compte-client')
          .then(m => m.CompteClient)
      },
      {
        path: 'registre-traitement',
        loadComponent: () => import('./features/client/pages/registre-traitement/registre-traitement')
          .then(m => m.RegistreTraitement)
      },

      {
        path: '',
        redirectTo: 'compte',
        pathMatch: 'full'
      }
    ]
  },

  // Redirection par défaut
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];