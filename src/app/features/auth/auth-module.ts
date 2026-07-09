import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { ReactiveFormsModule } from '@angular/forms';
import { Login } from './pages/login/login';
import { AccessDenied } from './pages/access-denied/access-denied';


@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    Login,
    AccessDenied
  ]
})
export class AuthModule { }
