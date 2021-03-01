import { Injectable } from '@angular/core';

// Services
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import { first, map } from 'rxjs/operators';
import { combineLatest, of } from "rxjs";
import * as firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor(private afs: AngularFirestore) {
  }

  createId () {
    return this.afs.createId ();
  }

  // Usuarios
  add_usuario (data: any) {
    data.id = this.createId ();
    return this.afs.collection ('Usuarios').doc (data.id).set (data);
  }

  get_usuarios () {
    return this.afs.collection ('Usuarios').valueChanges ();
  }

  delete_usuario (data: any) {
    return this.afs.collection ('Usuarios').doc (data.id).delete ();
  }

  update_usuario (data: any) {
    return this.afs.collection ('Usuarios').doc (data.id).update (data);
  }

  get_usuarios_by_tipo (tipo: number) {
    return this.afs.collection ('Usuarios', ref => ref.where ('tipo', '==', tipo)).valueChanges ();
  }

  // Vehiculos
  add_vehiculo (data: any) {
    data.id = this.createId ();
    return this.afs.collection ('Vehiculos').doc (data.id).set (data);
  }

  get_vehiculos () {
    return this.afs.collection ('Vehiculos', ref => ref.orderBy ('alias')).valueChanges ();
  }

  delete_vehiculo (data: any) {
    return this.afs.collection ('Vehiculos').doc (data.id).delete ();
  }

  update_vehiculo (data: any) {
    return this.afs.collection ('Vehiculos').doc (data.id).update ({
      alias: data.alias,
      nro_placa: data.nro_placa,
      marca: data.marca,
      modelo: data.modelo,
      peso_carga_bruta: data.peso_carga_bruta,
      volumen_carga_bruta: data.volumen_carga_bruta,
      conductor: data.conductor,
    });
  }

  // Terminal, Cliente
  add_terminal_cliente (data: any) {
    data.id = this.createId ();
    return this.afs.collection ('Terminal_Clientes').doc (data.id).set (data);
  }

  get_terminal_clientes () {
    return this.afs.collection ('Terminal_Clientes').valueChanges ();
  }

  delete_terminal_cliente (data: any) {
    return this.afs.collection ('Terminal_Clientes').doc (data.id).delete ();
  }

  update_terminal_cliente (data: any) {
    return this.afs.collection ('Terminal_Clientes').doc (data.id).update (data);
  }

  add_producto_terminal_cliente (id: string, data: any) {
    let request: any = {
      id: data.objectID,
      precio: 0,
    };

    return this.afs.collection ('Terminal_Clientes').doc (id).collection ('Productos_Precio').doc (request.id).set (request);
  }

  get_productos_precio_terminal_cliente (id: string) {
    const collection = this.afs.collection ('Terminal_Clientes').doc (id).collection ("Productos_Precio");

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data();
          return this.get_producto_clasificacion_by_id (data.id).pipe (map (ref => Object.assign ({}, { data, ref })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  remove_producto_terminal_cliente (user_id: string, id: string) {
    return this.afs.collection ('Terminal_Clientes').doc (user_id).collection ("Productos_Precio").doc (id).delete ();
  }

  update_producto_terminal_cliente (user_id: string, data: any) {
    return this.afs.collection ('Terminal_Clientes').doc (user_id).collection ("Productos_Precio").doc (data.id).update (data);
  }

  // Validar correo
  email_existe (email: string) {
    return this.afs.collection ('Correo_Usados').doc (email).valueChanges ();
  }


  // Eventos
  is_email_valid (email: string) {
    return this.afs.collection ('Correos_Usados').doc (email).valueChanges ();
  }

  getEventos () {
    return this.afs.collection ('Eventos', ref => ref.orderBy ('date_added')).snapshotChanges().map(changes => {
      return changes.map(a => {
          const data = a.payload.doc.data();
          let edit = false;
          const id = a.payload.doc.id;
          return { id, edit, ...data };
      });
    });
  }

  updateEvento (data: any) {
    return this.afs.collection ('Eventos').doc (data.id).update ({
      nombre: data.nombre
    });
  }

  addEvento (data: string) {
    let id = this.afs.createId ();

    return this.afs.collection ('Eventos').doc (id).set ({
      id: id,
      nombre: data,
      date_added: new Date ().toISOString (),
      eliminable: true
    });
  }

  removeEvento (data: any) {
    return this.afs.collection ('Eventos').doc (data.id).delete ();
  }

  // Categorias CRUD
  getCategorias () {
    return this.afs.collection ('Producto_Categorias', ref => ref.orderBy ('nombre')).valueChanges ();
  }

  updateCategoria (data: any) {
    return this.afs.collection ('Producto_Categorias').doc (data.id).update (data);
  }

  addCategoria (data: string) {
    let id = this.afs.createId ();

    return this.afs.collection ('Producto_Categorias').doc (id).set ({
      id: id,
      nombre: data,
      fecha_creada: new Date ().toISOString (),
      eliminable: true,
      cantidad_productos: 0
    });
  }

  removeCategoria (data: any) {
    return this.afs.collection ('Producto_Categorias').doc (data.id).delete ();
  }

  // Productos
  async generate_producto_id () {
    let id: number = Math.floor(Math.random () * 100000000);

    if (!this.id_existe (id.toString ())) {
      return this.generate_producto_id ();
    }

    return id;
  }

  async id_existe (id: string) {
    return await this.afs.collection ('ProductosIDsUsados').doc (id).valueChanges ().pipe(first()).toPromise();
  }

  async add_producto (data: any) {
    let batch = this.afs.firestore.batch ();

    let producto: any = {
      id: this.createId (),
      nombre: data.nombre,
      fecha_creada: new Date ().toISOString (),
      cantidad_productos: 0
    };

    batch.set (this.afs.collection ('Productos').doc (producto.id).ref, producto);

    data.producto_id = producto.id;
    data.producto_nombre = producto.nombre;
    data.es_producto = true;

    batch.set (this.afs.collection ('Productos_Clasificaciones').doc (data.id).ref, data)

    return await batch.commit ();
  }

  delete_producto_clasificacion (item: any) {
    return this.afs.collection ('Productos_Clasificaciones').doc (item.id).delete ();
  }

  get_producto_clasificacion_by_id (id: string) {
    return this.afs.collection ('Productos_Clasificaciones').doc (id).valueChanges ();
  }

  get_productos_prev (pagination: any) {
    return this.afs.collection ('Productos_Clasificaciones', ref => ref
      .orderBy ('nombre')
      .startAt (pagination)
      .limit (20)
    ).valueChanges ();
  }

  get_productos_next (pagination: any) {
    return this.afs.collection ('Productos_Clasificaciones', ref =>
      ref.limit (20)
      .orderBy ('nombre')
      .startAt (pagination)
    ).valueChanges ();
  }

  get_productos_first () {
    return this.afs.collection ('Productos_Clasificaciones', ref =>
      ref.limit (20)
      .orderBy ('nombre')
    ).valueChanges ();
  }

  add_presentacion (data: any, producto_id: string) {
    data.id = this.createId ();
    return this.afs.collection ('Productos').doc (producto_id).collection ('Presentaciones').doc (data.id).set (data);
  }

  get_presentaciones (producto_id: string) {
    return this.afs.collection ('Productos').doc (producto_id).collection ('Presentaciones').valueChanges ();
  }

  update_producto (item: any) {
    return this.afs.collection ('Productos_Clasificaciones').doc (item.id).set (item);
  }

  add_producto_clasificacion (item: any) {
    return this.afs.collection ('Productos_Clasificaciones').doc (item.id).set (item);
  }
  get_registro_actividad (categoria_id: string, anio: string, mes: string) {
    if (anio === '' && mes === '') {
      return this.afs.collection ('Producto_Categorias').doc (categoria_id).collection ('Actividades',
        ref => ref.orderBy ('precio', 'desc')
      ).valueChanges ();
    }

    if ((anio !== '' && mes === '')) {
      return this.afs.collection ('Producto_Categorias').doc (categoria_id).collection ('Actividades', ref =>
        ref.where ('anio', '==', anio).orderBy ('precio', 'desc')
      ).valueChanges ();
    }

    if ((anio === '' && mes !== '')) {
      return this.afs.collection ('Producto_Categorias').doc (categoria_id).collection ('Actividades', ref =>
        ref.where ('mes', '==', mes).orderBy ('precio', 'desc')
      ).valueChanges ();
    }

    if ((anio !== '' && mes !== '')) {
      return this.afs.collection ('Producto_Categorias').doc (categoria_id).collection ('Actividades', ref =>
        ref.where ('anio', '==', anio).where ('mes', '==', mes).orderBy ('precio', 'desc')
      ).valueChanges ();
    }
  }

  // Marca
  add_marca (nombre: string) {
    let data: any = {
      nombre: nombre,
      id: this.createId (),
      cantidad_productos: 0,
      fecha_creada: new Date ().toISOString ()
    };

    return this.afs.collection ('Producto_Marcas').doc (data.id).set (data);
  }

  get_marcas () {
    return this.afs.collection ('Producto_Marcas').valueChanges ();
  }

  remove_categoria (data: any) {
    return this.afs.collection ('Producto_Marcas').doc (data.id).delete ();
  }

  update_marca (data: any) {
    return this.afs.collection ('Producto_Marcas').doc (data.id).update (data);
  }

  get_productos_nodo () {
    return this.afs.collection ('Productos').valueChanges ();
  }

  async agregar_bloque_productos (items: any []) {
    let batch = this.afs.firestore.batch ();

    items.forEach ((item: any) => {
      let request: any = {
        id: this.createId (),
        fecha: new Date ().toISOString (),
        anio: new Date ().getFullYear (),
        mes: new Date ().getMonth (),
        tipo: 'ingreso',
        cantidad: item.cantidad,
        precio: item.precio,
        producto_id: item.objectID,
        producto_nombre: item.nombre
      };

      batch.set (
        this.afs.collection ('Producto_Movimientos').doc (request.id).ref,
        request
      );
    });

    return await batch.commit ();
  }

  /*
   *  Codigo de Vehiculos con carga
   */

  get_todos_pedidos (nodo: string) {
    return this.afs.collection (nodo).valueChanges ();
  }

  get_clientes_por_pedido (nodo: string, id: string) {
    return this.afs.collection (nodo).doc (id).collection ('informacion_clientes').valueChanges ();
  }

  get_clientes_por_pedido_no_subscribe (nodo: string, id: string) {
    return this.afs.collection (nodo).doc (id).collection ('informacion_clientes').valueChanges ().pipe(first()).toPromise();
  }

  get_pedidos_por_vehiculo (id: string) {
    const collection = this.afs.collection ('Vehiculos').doc (id).collection ('Pedidos');

    return collection.snapshotChanges ().pipe (map (refReferencias => {
      if (refReferencias.length > 0) {
        return refReferencias.map (refReferencia => {
          const data: any = refReferencia.payload.doc.data ();
          return this.get_picking_cardex_by_id (data.tipo, data.id).pipe (map ((pedido:any) => Object.assign ({}, { ...pedido, ...data })));
        });
      }
    })).mergeMap (observables => {
      if (observables) {
        return combineLatest(observables);
      } else {
        return of([]);
      }
    });
  }

  get_cardex_by_id (id: string) {
    return this.afs.collection ('Cardex').doc (id).valueChanges ();
  }

  get_picking_by_id (id: string) {
    return this.afs.collection ('Picking').doc (id).valueChanges ();
  }

  get_picking_cardex_by_id (node: string, id: string) {
    return this.afs.collection (node).doc (id).valueChanges ();
  }

  get_clientes_by_cardex (id: string) {
    return this.afs.collection ('Cardex').doc (id).collection ('informacion_clientes').valueChanges ();
  }

  get_clientes_by_picking (id: string) {
    return this.afs.collection ('Picking').doc (id).collection ('informacion_clientes').valueChanges ();
  }

  get_clientes_by_picking_cardex (nodo: string, id: string) {
    return this.afs.collection (nodo).doc (id).collection ('informacion_clientes').valueChanges ();
  }

  get_eventos_by_cardex (id: string) {
    return this.afs.collection ('Cardex').doc (id).collection ('Eventos').valueChanges ();
  }

  get_eventos_by_picking_cardex (node: string, id: string) {
    return this.afs.collection (node).doc (id).collection ('Eventos').valueChanges ();
  }

  async add_cardex (cardex: any, informacion_clientes: any [], Productos: any []) {
    let batch = this.afs.firestore.batch ();

    batch.set (
      this.afs.collection ('Cardex').doc (cardex.id).ref,
      cardex
    );

    batch.set (
      this.afs.collection ('Usuarios').doc (cardex.conductor_id).collection ('Pedidos').doc (cardex.id).ref,
      {
        id: cardex.id,
        tipo: 'Cardex',
        fecha: cardex.fecha,
        hora: cardex.hora,
        finalizado: false,
      }
    );

    batch.set (
      this.afs.collection ('Vehiculos').doc (cardex.vehiculo_id).collection ('Pedidos').doc (cardex.id).ref,
      {
        id: cardex.id,
        tipo: 'Cardex',
        estado: 'asignado',
        finalizado: false,
      }
    );

    Productos.forEach ((producto: any) => {
      batch.set (
        this.afs.collection ('Cardex').doc (cardex.id).collection ('Productos').doc (producto.id).ref,
        producto
      );
    });

    informacion_clientes.forEach ((cliente: any) => {
      cliente.Productos.forEach ((producto: any) => {
        batch.set (
          this.afs.collection ('Cardex').doc (cardex.id).collection ('informacion_clientes').doc (cliente.id).collection ('Productos').doc (producto.id).ref,
          producto
        );
      });

      delete cliente.Productos;

      batch.set (
        this.afs.collection ('Cardex').doc (cardex.id).collection ('informacion_clientes').doc (cliente.id).ref,
        cliente
      );
    });

    return await batch.commit ();
  }

  async add_picking (cardex: any, informacion_clientes: any [], Productos: any []) {
    let batch = this.afs.firestore.batch ();

    batch.set (
      this.afs.collection ('Picking').doc (cardex.id).ref,
      cardex
    );

    batch.set (
      this.afs.collection ('Vehiculos').doc (cardex.vehiculo_id).collection (cardex.fecha).doc (cardex.id).ref,
      {
        id: cardex.id,
        tipo: 'Picking'
      }
    );

    batch.set (
      this.afs.collection ('Usuarios').doc (cardex.conductor_id).collection (cardex.fecha).doc (cardex.id).ref,
      {
        id: cardex.id,
        tipo: 'Picking',
        fecha: cardex.fecha,
        hora: cardex.hora
      }
    );

    Productos.forEach ((producto: any) => {
      batch.set (
        this.afs.collection ('Picking').doc (cardex.id).collection ('Productos').doc (producto.id).ref,
        producto
      );
    });

    informacion_clientes.forEach ((cliente: any) => {
      cliente.Productos.forEach ((producto: any) => {
        batch.set (
          this.afs.collection ('Picking').doc (cardex.id).collection ('informacion_clientes').doc (cliente.id).collection ('Productos').doc (producto.id).ref,
          producto
        );
      });

      delete cliente.Productos;

      batch.set (
        this.afs.collection ('Picking').doc (cardex.id).collection ('informacion_clientes').doc (cliente.id).ref,
        cliente
      );
    });

    return await batch.commit ();
  }

  async add_pickings (pickings: any []) {
    let batch = this.afs.firestore.batch ();

    pickings.forEach ((picking: any) => {
      let productos: any [] = picking.productos;
      let clientes: any [] = picking.clientes;
      delete picking.productos;

      batch.set (
        this.afs.collection ('Picking').doc (picking.id).ref,
        picking
      );

      batch.set (
        this.afs.collection ('Usuarios').doc (picking.conductor_id).collection ('Pedidos').doc (picking.id).ref, {
          id: picking.id,
          tipo: 'Picking',
          fecha: picking.fecha,
          hora: picking.hora,
          finalizado: false,
        }
      );

      batch.set (
        this.afs.collection ('Vehiculos').doc (picking.vehiculo_id).collection ('Pedidos').doc (picking.id).ref,
        {
          id: picking.id,
          tipo: 'Picking',
          finalizado: false,
        }
      );

      productos.forEach ((producto: any) => {
        batch.set (
          this.afs.collection ('Picking').doc (picking.id).collection ('Productos').doc (producto.id).ref,
          producto
        );
      });

      clientes.forEach ((cliente: any) => {
        cliente.productos.forEach ((producto: any) => {
          batch.set (
            this.afs.collection ('Picking').doc (picking.id).collection ('informacion_clientes').doc (cliente.id).collection ('Productos').doc (producto.id).ref,
            producto
          );
        });

        delete cliente.productos;

        batch.set (
          this.afs.collection ('Picking').doc (picking.id).collection ('informacion_clientes').doc (cliente.id).ref,
          cliente
        );
      });
    });

    return await batch.commit ();
  }

  desbloquear_rechazo_total_cliente (nodo: string, cardex_id: string, cliente_id: string) {
    return this.afs.collection (nodo).doc (cardex_id).collection ('informacion_clientes').doc (cliente_id).update ({
      hora_rechazo_total: null,
      hora_ausencia: null,
      estado: 'llego'
    });
  }

  _get_clientes_by_cardex (nodo: string, id: string) {
    return this.afs.collection (nodo).doc (id).collection ('informacion_clientes', ref => ref.orderBy ('orden')).valueChanges ();
  }

  update_cardex (nodo: string, data: any) {
    if (data.estado === 'fin_ruta' || data.estado === 'camino_almacen') {
      data.hora_fin_ruta = firebase.firestore.FieldValue.serverTimestamp ();
      data.ultimo_cliente_hora = firebase.firestore.FieldValue.serverTimestamp ();
      data.cliente_actual = null;
    }

    return this.afs.collection (nodo).doc (data.id).update (data);
  }

  update_cliente_estado (nodo: string, data: any, cliente_actual_id: any) {
    return this.afs.collection (nodo).doc (data.id).collection ('informacion_clientes').doc (cliente_actual_id).update ({
      estado: 'finalizado',
    });
  }

  get_productos_pedido_cliente (nodo: string, pedido_id: string, cliente_id: string) {
    return this.afs.collection (nodo).doc (pedido_id).collection ('informacion_clientes').doc (cliente_id).collection ('Productos').valueChanges ();
  }

  get_vehiculo_recargas_gas (id: string) {
    return this.afs.collection ('Vehiculos').doc (id).collection ('Carga_Combustible', ref => ref.orderBy ('fecha_registro')).valueChanges ();
  }

  async eliminar_pedido (item: any) {
    let batch = this.afs.firestore.batch ();

    batch.delete (this.afs.collection (item.tipo).doc (item.id).ref);
    batch.delete (this.afs.collection ('Vehiculos').doc (item.vehiculo_id).collection ('Pedidos').doc (item.id).ref);
    batch.delete (this.afs.collection ('Usuarios').doc (item.conductor_id).collection ('Pedidos').doc (item.id).ref);

    return await batch.commit ();
  }
}
