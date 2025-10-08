import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Preconisations} from './preconisations';
const routes: Routes = [
   { path: '', component: Preconisations } 
];

@NgModule({
  imports: [RouterModule.forChild(routes), Preconisations],
  exports: [RouterModule]
})
export class PreconisationsRoutingModule { }
