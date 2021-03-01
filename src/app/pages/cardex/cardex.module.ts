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
  NbToggleModule,
  NbAlertModule,
  NbToastrModule, NbDialogModule
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { CardexRoutingModule } from './cardex-routing.module';
import { CardexComponent } from './cardex.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AgregarCardexComponent } from './agregar-cardex/agregar-cardex.component';
import { DashboardComponent } from './dashboard/dashboard.component';

// ToolTip
import { TooltipModule } from 'ng2-tooltip-directive';
import { HistorialComponent } from './historial/historial.component';
import { PreferenciasComponent } from './preferencias/preferencias.component';

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
    CardexRoutingModule,
    NbSelectModule,
    NbIconModule,
    NbSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NbAccordionModule,
    NbTabsetModule,
    NbStepperModule,
    NbToggleModule,
    TooltipModule,
    NbAlertModule,
    NbToastrModule,
    NbDialogModule
  ],
  declarations: [
    CardexComponent,
    AgregarCardexComponent,
    DashboardComponent,
    HistorialComponent,
    PreferenciasComponent
  ],
})

export class CardexModule { }
