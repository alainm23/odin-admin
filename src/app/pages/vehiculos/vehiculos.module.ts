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
import { VehiculosRoutingModule } from './vehiculos-routing.module';
import { VehiculosComponent } from './vehiculos.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AgregarVehiculoComponent } from './agregar-vehiculo/agregar-vehiculo.component';
import { ListarVehiculosComponent } from './listar-vehiculos/listar-vehiculos.component';

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
    VehiculosRoutingModule,
    NbSelectModule,
    NbIconModule,
    NbSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NbAccordionModule
  ],
  declarations: [
    VehiculosComponent,
    AgregarVehiculoComponent,
    ListarVehiculosComponent
  ],
})

export class VehiculosModule { }