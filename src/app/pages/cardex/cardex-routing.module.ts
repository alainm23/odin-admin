import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CardexComponent } from './cardex.component';
import { AgregarCardexComponent } from './agregar-cardex/agregar-cardex.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HistorialComponent } from './historial/historial.component';
import { PreferenciasComponent } from './preferencias/preferencias.component';

const routes: Routes = [{
  path: '',
  component: CardexComponent,
  children: [
    {
      path: 'agregar-cardex',
      component: AgregarCardexComponent,
    },
    {
      path: 'dashboard',
      component: DashboardComponent,
    },
    {
      path: 'historial',
      component: HistorialComponent,
    },
    {
      path: 'preferencias',
      component: PreferenciasComponent
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class CardexRoutingModule {
}
