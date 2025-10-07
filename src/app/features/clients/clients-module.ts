import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientsRoutingModule } from './clients-routing-module';
import { Clients } from './clients';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    Clients
  ]
})
export class ClientsModule { }
