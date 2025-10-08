import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Administrators } from './administrators';
import { AdministratorsRoutingModule } from './administrators-routing-module';

@NgModule({
  imports: [
    CommonModule,
    Administrators,
    AdministratorsRoutingModule
  ]
})
export class AdministratorsModule { }
