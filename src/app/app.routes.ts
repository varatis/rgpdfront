import { Routes } from '@angular/router';
import { adminGuard, authGuard, clientGuard } from './core/guards/auth-guard';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { ClientLayout } from './layout/client-layout/client-layout';

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
        path: 'hello-world',
        loadComponent: () => import('./features/hello-world/hello-world')
          .then(m => m.HelloWorld)
      },
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
    path: 'app',
    component: ClientLayout,
    canActivate: [authGuard, clientGuard],
    children: [
      {
        path: 'hello-world',
        loadComponent: () => import('./features/hello-world/hello-world')
          .then(m => m.HelloWorld)
      },
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
        path: 'registre-traitement',
        loadComponent: () => import('./features/user/pages/registre-traitement/registre-traitement')
          .then(m => m.RegistreTraitement)
      },
      {
        path: 'recueil-violation',
        loadComponent: () => import('./features/user/pages/recueil-violation/recueil-violation')
          .then(m => m.RecueilViolation)

      },
      {
        path: 'registre-demandes',
        loadComponent: () => import('./features/user/pages/registre-demandes/registre-demandes')
          .then(m => m.RegistreDemandes)
      },
      {
        path: 'sous-traitant-dcp',
        loadComponent: () => import('./features/user/pages/sous-traitant-dcp/sous-traitant-dcp')
          .then(m => m.SousTraitantDcp)

      },
      {
        path: 'suivi-preconisations',
        loadComponent: () => import('./features/user/pages/suivi-preconisations/suivi-preconisations')
          .then(m => m.SuiviPreconisations)

      },

      {
        path: '',
        redirectTo: 'registre-traitement',
        pathMatch: 'full'
      }
    ]
  },


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