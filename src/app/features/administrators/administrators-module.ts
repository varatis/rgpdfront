import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Administrators } from './administrators';
import { SharedModule } from '../../shared/shared-module';

@NgModule({
  imports: [
    CommonModule,
    Administrators
  ]
})
export class AdministratorsModule { }
