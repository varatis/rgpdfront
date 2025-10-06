import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Administrators } from './administrators';
const routes: Routes = [
  { path: '', component: Administrators }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministratorsRoutingModule { }
