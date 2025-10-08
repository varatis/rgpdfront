import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreconisationsRoutingModule } from './preconisations-routing-module';
import { Preconisations } from './preconisations';

@NgModule({
  imports: [
    CommonModule,
    PreconisationsRoutingModule,
    Preconisations
  ]
})
export class PreconisationsModule { }
