import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { AccessDenied } from './pages/access-denied/access-denied';

const routes: Routes = [
  {
    path: '',
    component: Login
  },
  {
    path: 'access-denied',
    component: AccessDenied
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
