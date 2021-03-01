import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EventosComponent } from './eventos.component';
import { AgregarEventoComponent } from './agregar-evento/agregar-evento.component';
import { ListaEventosComponent } from './lista-eventos/lista-eventos.component';

const routes: Routes = [{
  path: '',
  component: EventosComponent,
  children: [
    {
      path: 'agregar-evento',
      component: AgregarEventoComponent,
    },
    {
      path: 'lista-eventos',
      component: ListaEventosComponent,
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class EventosRoutingModule {
}