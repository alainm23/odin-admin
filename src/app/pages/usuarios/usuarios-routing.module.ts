import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuariosComponent } from './usuarios.component';
import { AgregarUsuarioComponent } from './agregar-usuario/agregar-usuario.component';
import { ListarUsuariosComponent } from './listar-usuarios/listar-usuarios.component';

const routes: Routes = [{
  path: '',
  component: UsuariosComponent,
  children: [
    {
      path: 'agregar-usuario',
      component: AgregarUsuarioComponent,
    },
    {
      path: 'listar-usuarios',
      component: ListarUsuariosComponent,
    }
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class UsuariosRoutingModule {
}