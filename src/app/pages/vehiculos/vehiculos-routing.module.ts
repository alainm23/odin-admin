import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VehiculosComponent } from './vehiculos.component';
import { AgregarVehiculoComponent } from './agregar-vehiculo/agregar-vehiculo.component';
import { ListarVehiculosComponent } from './listar-vehiculos/listar-vehiculos.component'

const routes: Routes = [{
  path: '',
  component: VehiculosComponent,
  children: [
    {
      path: 'agregar-vehiculo',
      component: AgregarVehiculoComponent,
    },
    {
        path: 'listar-vehiculos',
        component: ListarVehiculosComponent,
      }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class VehiculosRoutingModule {
}