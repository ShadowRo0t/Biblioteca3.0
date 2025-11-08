import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Lista } from './lista/lista';


const routes: Routes = [
  { path: '', component: Lista}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsuariosRoutingModule {}
