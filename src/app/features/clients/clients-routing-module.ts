import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Clients } from './clients';

const routes: Routes = [
  { path: '', component: Clients }
];

@NgModule({
  imports: [RouterModule.forChild(routes), Clients],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
