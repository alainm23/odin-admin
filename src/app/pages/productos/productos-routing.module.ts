import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductosComponent } from './productos.component';
import { AgregarProductoComponent } from './agregar-producto/agregar-producto.component';
import { ListarProductosComponent } from './listar-productos/listar-productos.component';
import { AdministrarCategoriasComponent } from './administrar-categorias/administrar-categorias.component';
import { AdministrarMarcasComponent } from './administrar-marcas/administrar-marcas.component';
import { OverviewComponent } from './overview/overview.component';
import { RegistrarOperacionLoteComponent } from './registrar-operacion-lote/registrar-operacion-lote.component';

const routes: Routes = [{
  path: '',
  component: ProductosComponent,
  children: [
    {
      path: 'agregar-producto',
      component: AgregarProductoComponent,
    },
    {
      path: 'listar-productos',
      component: ListarProductosComponent,
    },
    {
      path: 'administrar-categorias',
      component: AdministrarCategoriasComponent,
    },
    {
      path: 'administrar-marcas',
      component: AdministrarMarcasComponent,
    },
    {
      path: 'overview',
      component: OverviewComponent,
    },
    {
      path: 'registrar-operacion-lote',
      component: RegistrarOperacionLoteComponent,
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class ProductosRoutingModule {
}