import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Home',
    link: '/pages/home',
    home: true,
  },
  {
    title: 'Usuarios',
    children: [
      {
        title: 'Agregar',
        link: '/pages/usuarios/agregar-usuario'
      },
      {
        title: 'Listar',
        link: '/pages/usuarios/listar-usuarios'
      }
    ]
  },
  {
    title: 'Vehiculos',
    children: [
      {
        title: 'Agregar',
        link: '/pages/vehiculos/agregar-vehiculo'
      },
      {
        title: 'Listar',
        link: '/pages/vehiculos/listar-vehiculos'
      }
    ]
  },
  {
    title: 'Clientes',
    children: [
      {
        title: 'Agregar',
        link: '/pages/terminales-clientes/agrega-terminales-clientes'
      },
      {
        title: 'Listar',
        link: '/pages/terminales-clientes/listar-terminales-clientes'
      }
    ]
  },
  {
    title: 'Alicorp',
    children: [
      {
        title: 'Dashboard',
        link: '/pages/alicorp/dashboard'
      },
      {
        title: 'Agregar picking',
        link: '/pages/alicorp/agregar-picking'
      },
      {
        title: 'Historial picking',
        link: '/pages/alicorp/historial-picking'
      }
    ]
  },
  {
    title: 'Eventos',
    children: [
      {
        title: 'Gestionar eventos',
        link: '/pages/eventos/agregar-evento'
      },
      {
        title: 'Listar eventos',
        link: '/pages/eventos/lista-eventos'
      }
    ]
  },
  {
    title: 'Picking',
    children: [
      {
        title: 'Agregar picking',
        link: '/pages/picking/agregar-picking'
      }
    ]
  },
  {
    title: 'Productos',
    children: [
      {
        title: 'Agregar',
        link: '/pages/productos/agregar-producto'
      }
    ]
  }
];
