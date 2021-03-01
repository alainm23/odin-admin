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
  NbAccordionModule,
  NbTabsetModule,
  NbStepperModule,
  NbToggleModule
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { PickingRoutingModule } from './picking-routing.module';
import { PickingComponent } from './picking.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AgregarPickingComponent } from './agregar-picking/agregar-picking.component';

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
    PickingRoutingModule,
    NbSelectModule,
    NbIconModule,
    NbSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NbAccordionModule,
    NbTabsetModule,
    NbStepperModule,
    NbToggleModule
  ],
  declarations: [
    PickingComponent,
    AgregarPickingComponent
  ],
})

export class PickingModule { }