import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlicorpComponent } from './alicorp.component';
import { AgregarPickingComponent } from './agregar-picking/agregar-picking.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HistorialPickingComponent } from './historial-picking/historial-picking.component';

const routes: Routes = [{
  path: '',
  component: AlicorpComponent,
  children: [
    {
      path: 'agregar-picking',
      component: AgregarPickingComponent,
    },
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'historial-picking',
      component: HistorialPickingComponent,
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class AlicorpRoutingModule {
}