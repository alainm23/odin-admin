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
import { TerminalesClientesRoutingModule } from './terminales-clientes-routing.module';
import { TerminalesClientesComponent } from './terminales-clientes.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AgregaTerminalesClientesComponent } from './agrega-terminales-clientes/agrega-terminales-clientes.component';
import { ListarTerminalesClientesComponent } from './listar-terminales-clientes/listar-terminales-clientes.component';

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
    TerminalesClientesRoutingModule,
    NbSelectModule,
    NbIconModule,
    NbSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NbAccordionModule
  ],
  declarations: [
    TerminalesClientesComponent,
    AgregaTerminalesClientesComponent,
    ListarTerminalesClientesComponent
  ],
})

export class TerminalesClientesModule { }