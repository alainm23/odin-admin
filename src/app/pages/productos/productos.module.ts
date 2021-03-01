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
  NbProgressBarModule,
  NbDialogModule
} from '@nebular/theme';

import { ThemeModule } from '../../@theme/theme.module';
import { ProductosRoutingModule } from './productos-routing.module';
import { ProductosComponent } from './productos.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AgregarProductoComponent } from './agregar-producto/agregar-producto.component';
import { ListarProductosComponent } from './listar-productos/listar-productos.component';
import { AdministrarCategoriasComponent } from './administrar-categorias/administrar-categorias.component';
import { OverviewComponent } from './overview/overview.component';

// Import ngx-barcode module
import { NgxBarcodeModule } from 'ngx-barcode';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AdministrarMarcasComponent } from './administrar-marcas/administrar-marcas.component';
import { RegistrarOperacionLoteComponent } from './registrar-operacion-lote/registrar-operacion-lote.component';

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
    ProductosRoutingModule,
    NbSelectModule,
    NbIconModule,
    NbSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    NbAccordionModule,
    NbProgressBarModule,
    NbDialogModule,
    NgxBarcodeModule,
    InfiniteScrollModule,
  ],
  declarations: [
    ProductosComponent,
    AgregarProductoComponent,
    ListarProductosComponent,
    AdministrarCategoriasComponent,
    OverviewComponent,
    AdministrarMarcasComponent,
    RegistrarOperacionLoteComponent
  ],
})

export class ProductosModule { }