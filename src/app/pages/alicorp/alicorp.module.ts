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
import { AlicorpRoutingModule } from './alicorp-routing.module';
import { AlicorpComponent } from './alicorp.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AgregarPickingComponent } from './agregar-picking/agregar-picking.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HistorialPickingComponent } from './historial-picking/historial-picking.component';

// ToolTip
import { TooltipModule } from 'ng2-tooltip-directive';
import { OrderModule } from 'ngx-order-pipe';

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
    AlicorpRoutingModule,
    NbSelectModule,
    NbIconModule,
    NbSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NbAccordionModule,
    NbTabsetModule,
    TooltipModule,
    NbStepperModule,
    NbToggleModule,
    OrderModule
  ],
  declarations: [
    AlicorpComponent,
    AgregarPickingComponent,
    DashboardComponent,
    HistorialPickingComponent
  ],
})

export class AlicorpModule { }
