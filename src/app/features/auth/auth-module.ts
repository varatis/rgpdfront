import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing-module';
import { ReactiveFormsModule } from '@angular/forms';
import { Login } from './pages/login/login';


@NgModule({
  declarations: [
    // ...existing code...
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    Login
  ]
})
export class AuthModule { }
