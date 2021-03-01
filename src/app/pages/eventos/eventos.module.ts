import { NgModule } from '@angular/core';

import {
  NbActionsModule,
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDatepickerModule, 
  NbIconModule,
  NbInputModule,
  NbRadioModule,
  NbSelectModule,
  NbUserModule,
  NbSpinnerModule,
  NbListModule,
  NbAccordionModule
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { EventosRoutingModule } from './eventos-routing.module';
import { EventosComponent } from './eventos.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AgregarEventoComponent } from './agregar-evento/agregar-evento.component';
import { ListaEventosComponent } from './lista-eventos/lista-eventos.component';

@NgModule({
  imports: [
    ThemeModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbActionsModule,
    NbUserModule,
    NbCheckboxModule,
    NbRadioModule,
    NbDatepickerModule,
    NbListModule,
    EventosRoutingModule,
    NbSelectModule,
    NbIconModule,
    NbSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NbAccordionModule
  ],
  declarations: [
    EventosComponent,
    AgregarEventoComponent,
    ListaEventosComponent
  ],
})

export class EventosModule { }