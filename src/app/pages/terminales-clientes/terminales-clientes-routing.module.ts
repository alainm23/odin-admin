import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TerminalesClientesComponent } from './terminales-clientes.component';
import { AgregaTerminalesClientesComponent } from './agrega-terminales-clientes/agrega-terminales-clientes.component';
import { ListarTerminalesClientesComponent } from './listar-terminales-clientes/listar-terminales-clientes.component';

const routes: Routes = [{
  path: '',
  component: TerminalesClientesComponent,
  children: [
    {
      path: 'agrega-terminales-clientes',
      component: AgregaTerminalesClientesComponent,
    },
    {
      path: 'listar-terminales-clientes',
      component: ListarTerminalesClientesComponent,
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class TerminalesClientesRoutingModule {
}