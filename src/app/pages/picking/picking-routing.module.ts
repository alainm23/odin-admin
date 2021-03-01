import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickingComponent } from './picking.component';
import { AgregarPickingComponent } from './agregar-picking/agregar-picking.component';

const routes: Routes = [{
  path: '',
  component: PickingComponent,
  children: [
    {
      path: 'agregar-picking',
      component: AgregarPickingComponent,
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class PickingRoutingModule {
}