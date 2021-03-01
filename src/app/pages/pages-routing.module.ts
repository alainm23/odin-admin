import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'home',
      component: HomeComponent
    },
    {
      path: 'usuarios',
      loadChildren: () => import('./usuarios/usuarios.module')
        .then(m => m.UsuariosModule),
    },
    {
      path: 'vehiculos',
      loadChildren: () => import('./vehiculos/vehiculos.module')
        .then(m => m.VehiculosModule),
    },
    {
      path: 'terminales-clientes',
      loadChildren: () => import('./terminales-clientes/terminales-clientes.module')
        .then(m => m.TerminalesClientesModule),
    },
    {
      path: 'eventos',
      loadChildren: () => import('./eventos/eventos.module')
        .then(m => m.EventosModule),
    },
    {
      path: 'productos',
      loadChildren: () => import('./productos/productos.module')
        .then(m => m.ProductosModule),
    },
    {
      path: 'alicorp',
      loadChildren: () => import('./alicorp/alicorp.module')
        .then(m => m.AlicorpModule),
    },
    {
      path: 'picking',
      loadChildren: () => import('./picking/picking.module')
        .then(m => m.PickingModule),
    },
    {
      path: 'cardex',
      loadChildren: () => import('./cardex/cardex.module')
        .then(m => m.CardexModule),
    },
    {
      path: '',
      redirectTo: 'home',
      pathMatch: 'full'
    },
    {
      path: '**',
      component: NotFoundComponent
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
