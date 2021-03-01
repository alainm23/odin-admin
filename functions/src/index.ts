import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as moment from 'moment';
import * as express from 'express';
import * as bodyParser from "body-parser";
// import * as https from 'https';
import * as OneSignal from 'onesignal-node';

admin.initializeApp ();

// Initialize express server
const app = express ();
const main = express ();

// Add the path to receive request and set json as bodyParser to process the body
main.use ('/api/v1', app);
main.use (bodyParser.json());
main.use (bodyParser.urlencoded({ extended: false }));

// OneSignal
const client = new OneSignal.Client('44a9bc94-1355-4e1d-bda3-9b04a5c47316', 'ZmU2ZmQ3ZGEtMTUxYy00NzNlLWEzZTctMjllZmY1MWVkZWEy');

export const webApi = functions.https.onRequest (main);

const db = admin.firestore ();

exports.registrar_usuario = functions.firestore.document ('Usuarios/{usuario}').onCreate ((snapshot: any, context: any) => {
  const id = snapshot.data ().id;
  const email = snapshot.data ().email;
  const password = snapshot.data ().password;

  return admin.auth().createUser({
    uid: id,
    email: email,
    password: password
  }).then (() => {
    return db.collection ('Correo_Usados').doc (email).set ({
        id: email
    });
  });
});

exports.eliminar_usuario = functions.firestore.document ('Usuarios/{usuario}').onDelete ((snapshot: any, context: any) => {
    const id = snapshot.data ().id;
    return admin.auth ().deleteUser (id);
});

// Transacciones
exports.addProducto = functions.firestore.document ('Productos/{id}').onCreate ((snapshot: any, context: any) => {
  const ref = db.collection ('Servicios_Acumulados').doc (new Date ().getFullYear ().toString ());

  return db.runTransaction((t: any) => {
    return t.get (ref).then ((doc: any) => {
      const data = doc.data ();
      const update: any = {};

      if (doc.exists === false) {
        update ['cantidad_productos'] = 1;
        t.set(ref, update);
      } else {
        update ['cantidad_productos'] = data ['cantidad_productos'] + 1;
        t.update (ref, update);
      }
    });
  }).then (() => {
    const ref_02 = db.collection ('Servicios_Acumulados').doc ('Total');

    return db.runTransaction((t: any) => {
      return t.get (ref_02).then ((doc: any) => {
        const data = doc.data ();
        const update: any = {};

        if (doc.exists === false) {
          update ['cantidad_productos'] = 1;
          t.set(ref_02, update);
        } else {
          update ['cantidad_productos'] = data ['cantidad_productos'] + 1;
          t.update (ref_02, update);
        }
      });
    });
  })
});

exports.removeProducto = functions.firestore.document ('Productos/{id}').onDelete ((snapshot: any, context: any) => {
  const ref = db.collection ('Servicios_Acumulados').doc (new Date ().getFullYear ().toString ());

  return db.runTransaction((t: any) => {
    return t.get (ref).then ((doc: any) => {
      const data = doc.data ();
      const update: any = {};

      if (doc.exists === false) {
        update ['cantidad_productos'] = 0;
        t.set(ref, update);
      } else {
        update ['cantidad_productos'] = data ['cantidad_productos'] - 1;
        t.update (ref, update);
      }
    });
  }).then (() => {
    const ref_02 = db.collection ('Servicios_Acumulados').doc ('Total');

    return db.runTransaction((t: any) => {
      return t.get (ref_02).then ((doc: any) => {
        const data = doc.data ();
        const update: any = {};

        if (doc.exists === false) {
          update ['cantidad_productos'] = 0;
          t.set(ref_02, update);
        } else {
          update ['cantidad_productos'] = data ['cantidad_productos'] - 1;
          t.update (ref_02, update);
        }
      });
    });
  })
});

exports.addProductoCategoria = functions.firestore.document ('Producto_Categorias/{id}').onCreate ((snapshot: any, context: any) => {
  const ref = db.collection ('Servicios_Acumulados').doc (new Date ().getFullYear ().toString ());

  return db.runTransaction((t: any) => {
    return t.get (ref).then ((doc: any) => {
      const data = doc.data ();
      const update: any = {};

      if (doc.exists === false) {
        update ['cantidad_categorias'] = 1;
        t.set(ref, update);
      } else {
        update ['cantidad_categorias'] = data ['cantidad_categorias'] + 1;
        t.update (ref, update);
      }
    });
  }).then (() => {
    const ref_02 = db.collection ('Servicios_Acumulados').doc ('Total');

    return db.runTransaction((t: any) => {
      return t.get (ref_02).then ((doc: any) => {
        const data = doc.data ();
        const update: any = {};

        if (doc.exists === false) {
          update ['cantidad_categorias'] = 1;
          t.set(ref_02, update);
        } else {
          update ['cantidad_categorias'] = data ['cantidad_categorias'] + 1;
          t.update (ref_02, update);
        }
      });
    });
  })
});

exports.removeProductoCategoria = functions.firestore.document ('Producto_Categorias/{id}').onDelete ((snapshot: any, context: any) => {
  const ref = db.collection ('Servicios_Acumulados').doc (new Date ().getFullYear ().toString ());

  return db.runTransaction((t: any) => {
    return t.get (ref).then ((doc: any) => {
      const data = doc.data ();
      const update: any = {};

      if (doc.exists === false) {
        update ['cantidad_categorias'] = 0;
        t.set(ref, update);
      } else {
        update ['cantidad_categorias'] = data ['cantidad_categorias'] - 1;
        t.update (ref, update);
      }
    });
  }).then (() => {
    const ref_02 = db.collection ('Servicios_Acumulados').doc ('Total');

    return db.runTransaction((t: any) => {
      return t.get (ref_02).then ((doc: any) => {
        const data = doc.data ();
        const update: any = {};

        if (doc.exists === false) {
          update ['cantidad_categorias'] = 0;
          t.set(ref_02, update);
        } else {
          update ['cantidad_categorias'] = data ['cantidad_categorias'] - 1;
          t.update (ref_02, update);
        }
      });
    });
  })
});

exports.updateCategoriaNombre = functions.firestore.document ('Productos_Clasificaciones/{id}').onUpdate (async (snapshot: any, context: any) => {
  /*
    - Actualizar el nombre de la categoria de un  producto cuando este es cambiado.
    - Tenemos que tenert el cuenta el categoria_id para cambiar esto.
    - Si la categoria cambia, sumanos y restamos la cantidad de productos
      en en documento de la caregoria.
  */

  const before = snapshot.before.data ();
  const after = snapshot.after.data ();

  if (before.categoria_id !== after.categoria_id) {
    const categoria: any = await db.collection ('Producto_Categorias').doc (after.categoria_id).get ();

    return db.collection ('Productos_Clasificaciones').doc (after.id).update ({
      'categoria_nombre': categoria.data ().nombre
    }).then (() => {
      const ref = db.collection ('Producto_Categorias').doc (after.categoria_id);

      return db.runTransaction ((t: any) => {
        return t.get (ref).then ((doc: any) => {
          const data = doc.data ();
          const update: any = {};

          if (doc.exists === false) {
            update ['cantidad_productos'] = 1;
            t.set (ref, update);
          } else {
            update ['cantidad_productos'] = data ['cantidad_productos'] + 1;
            t.update (ref, update);
          }
        });
      }).then (() => {
        const ref_2 = db.collection ('Producto_Categorias').doc (before.categoria_id);

        return db.runTransaction ((t: any) => {
          return t.get (ref_2).then ((doc: any) => {
            const data = doc.data ();
            const update: any = {};

            if (doc.exists === true) {
              update ['cantidad_productos'] = data ['cantidad_productos'] - 1;
              t.update (ref_2, update);
            }
          });
        });
      });
    });
  }

  if (before.marca_id !== after.marca_id) {
    const categoria: any = await db.collection ('Producto_Marcas').doc (after.marca_id).get ();

    return db.collection ('Productos_Clasificaciones').doc (after.id).update ({
      'marca_nombre': categoria.data ().nombre
    }).then (() => {
      const ref = db.collection ('Producto_Marcas').doc (after.marca_id);

      return db.runTransaction ((t: any) => {
        return t.get (ref).then ((doc: any) => {
          const data = doc.data ();
          const update: any = {};

          if (doc.exists === false) {
            update ['cantidad_productos'] = 1;
            t.set (ref, update);
          } else {
            update ['cantidad_productos'] = data ['cantidad_productos'] + 1;
            t.update (ref, update);
          }
        });
      }).then (() => {
        const ref_2 = db.collection ('Producto_Marcas').doc (before.marca_id);

        return db.runTransaction ((t: any) => {
          return t.get (ref_2).then ((doc: any) => {
            const data = doc.data ();
            const update: any = {};

            if (doc.exists === true) {
              update ['cantidad_productos'] = data ['cantidad_productos'] - 1;
              t.update (ref_2, update);
            }
          });
        });
      });
    });
  }

  return 0;
});

exports.runAddProductoClasificacion = functions.firestore.document ('Productos_Clasificaciones/{id}').onCreate (async (snapshot: any, context: any) => {
  const productos_ref = db.collection ('Productos').doc (snapshot.data ().producto_id);

  return db.runTransaction ((t: any) => {
    return t.get (productos_ref).then ((doc: any) => {
      const data = doc.data ();
      const update: any = {};

      if (doc.exists === false) {
        update ['cantidad_productos'] = 1;
        t.set (productos_ref, update);
      } else {
        update ['cantidad_productos'] = data ['cantidad_productos'] + 1;
        t.update (productos_ref, update);
      }
    });
  }).then (() => {
    const categoria_ref = db.collection ('Producto_Categorias').doc (snapshot.data ().categoria_id);

    return db.runTransaction ((t: any) => {
      return t.get (categoria_ref).then ((doc: any) => {
        const data = doc.data ();
        const update: any = {};

        if (doc.exists === false) {
          update ['cantidad_productos'] = 1;
          t.set (categoria_ref, update);
        } else {
          update ['cantidad_productos'] = data ['cantidad_productos'] + 1;
          t.update (categoria_ref, update);
        }
      });
    }).then (() => {
      const marca_ref = db.collection ('Producto_Marcas').doc (snapshot.data ().marca_id);

      return db.runTransaction ((t: any) => {
        return t.get (marca_ref).then ((doc: any) => {
          const data = doc.data ();
          const update: any = {};

          if (doc.exists === false) {
            update ['cantidad_productos'] = 1;
            t.set (marca_ref, update);
          } else {
            update ['cantidad_productos'] = data ['cantidad_productos'] + 1;
            t.update (marca_ref, update);
          }
        });
      });
    });
  });
});

exports.removeProductoClasificacion = functions.firestore.document ('Productos_Clasificaciones/{id}').onDelete ((snapshot: any, context: any) => {
  const productos_ref = db.collection ('Productos').doc (snapshot.data ().producto_id);

  return db.runTransaction ((t: any) => {
    return t.get (productos_ref).then ((doc: any) => {
      const data = doc.data ();
      const update: any = {};

      if (doc.exists === true) {
        update ['cantidad_productos'] = data ['cantidad_productos'] - 1;
        t.update (productos_ref, update);
      }
    });
  }).then (() => {
    const categoria_ref = db.collection ('Producto_Categorias').doc (snapshot.data ().categoria_id);

    return db.runTransaction ((t: any) => {
      return t.get (categoria_ref).then ((doc: any) => {
        const data = doc.data ();
        const update: any = {};

        if (doc.exists === true) {
          update ['cantidad_productos'] = data ['cantidad_productos'] - 1;
          t.update (categoria_ref, update);
        }
      });
    }).then (() => {
      const marca_ref = db.collection ('Producto_Marcas').doc (snapshot.data ().marca_id);

      return db.runTransaction ((t: any) => {
        return t.get (marca_ref).then ((doc: any) => {
          const data = doc.data ();
          const update: any = {};

          if (doc.exists === true) {
            update ['cantidad_productos'] = data ['cantidad_productos'] - 1;
            t.update (marca_ref, update);
          }
        });
      });
    });
  });
});

exports.actualizarCantidadProductoMovimiento = functions.firestore.document ('Producto_Movimientos/{id}')
  .onCreate ((snapshot: any, context: any) => {
    const data = snapshot.data ();

    const productos_ref = db.collection ('Productos_Clasificaciones').doc (data.producto_id);

    return db.runTransaction ((t: any) => {
      return t.get (productos_ref).then ((doc: any) => {
        const _data = doc.data ();
        const update: any = {};

        if (doc.exists === false) {
          update ['stock'] = data.cantidad;
          t.set (productos_ref, update);
        } else {
          update ['stock'] = _data ['stock'] + data.cantidad;
          t.update (productos_ref, update);
        }
      });
    });
});

exports.EstadisticasClienteCardexFinalizado = functions.firestore.document ('/Cardex/{cardex_id}/informacion_clientes/{cliente_id}')
  .onUpdate (async (snapshot: any, context: any) => {
  const cardex_id = context.params.cardex_id;
  const cliente_before = snapshot.before.data ();
  const cliente_after = snapshot.after.data ();

  const anio = moment ().format ('YYYY');
  const mes = moment ().format ('MM');

  if ((cliente_before.estado !== cliente_after.estado) && cliente_after.estado === 'finalizado') {
    // 1. Actualizar la cantidad de monto del cliente en la en la fecha atual
    // - Traer todos los productos del cliente y contar

    let monto: number = 0;
    let cantidad: number = 0;

    const cliente_productos = await db.collection ('Cardex').doc (cardex_id).collection ('informacion_clientes').doc (cliente_before.id).collection ('Productos').get ();
    cliente_productos.forEach (async (producto: any) => {
      monto += producto.data ().precio_base;
      cantidad += producto.data ().cantidad - producto.data ().rechazo_cantidad;
    });

    console.log ('Cantodad', cantidad);
    console.log ('Monto', monto);

    const cliente_ref = db.collection ('Terminal_Clientes').doc (cliente_before.id);

    return db.runTransaction((t: any) => {
      return t.get (cliente_ref).then ((doc: any) => {
        const data = doc.data ();

        if (data ['resumen_monto_' + anio] === null || data ['resumen_monto_' + anio] === undefined) {
          data ['resumen_monto_' + anio] ['monto_comprado_' + mes] = 0;
        }

        if (data ['resumen_cantidad_compra_' + anio] === null || data ['resumen_cantidad_compra_' + anio] === undefined) {
          data ['resumen_cantidad_compra_' + anio] ['cantidad_compra_' + mes] = 0;
        }

        data ['resumen_monto_' + anio] ['monto_comprado_' + mes] = monto;
        data ['resumen_cantidad_compra_' + anio] ['cantidad_compra_' + mes] = cantidad;

        console.log (data);

        t.update (cliente_ref, data);
      });
    });
  }

  return 0;
});

app.get ('/verificar_vehiculos_pedidos/', async (request: any, response: any) => {
  try {
    const pedidos = await db.collection ('Cardex').where ('activo', '==', true).get ();
    pedidos.forEach(async (_pedido: any) => {
      const pedido = _pedido.data ();

      if (pedido.estado === 'en_ruta' && pedido.cliente_actual !== null) {
        if (pedido.cliente_actual.orden <= 0) {
          const duracion: number = pedido.clientes [0].duracion;

          const hora_actual = admin.firestore.Timestamp.now ().toDate ();
          const hora_limite = pedido.hora_inicio_ruta.toDate ().setSeconds (duracion);

          const diferencia = calcular_diferencia (hora_actual, hora_limite);

          if (diferencia < 0) {
            const body: any = {
              'app_id': '44a9bc94-1355-4e1d-bda3-9b04a5c47316',
              'headings': {
                'en': 'Alerta de retraso',
                'es': 'Alerta de retraso'
              },
              'contents': {
                'en': `El conductor ${pedido.conductor_nombre} con el vehiculo ${pedido.vehiculo_alias} se encuentran retrasados en el pedido ${pedido.alias}`,
                'es': `El conductor ${pedido.conductor_nombre} con el vehiculo ${pedido.vehiculo_alias} se encuentran retrasados en el pedido ${pedido.alias}`,
              },
              'filters': [
                { "field": "tag", "key": 'Administrador', "relation": "exists" }
              ],
              'data': {
                'id': pedido.id
              }
            };

            if (pedido.cliente_actual.notificado === undefined || pedido.cliente_actual.notificado === false) {
              client.createNotification (body)
              .then (async (res: any) => {
                console.log ('res', res);

                let update = pedido.cliente_actual;
                update ['notificado'] = true;
                update ['notificado_hora'] = admin.firestore.Timestamp.now ();

                // Desactivar alerta
                const batch = db.batch ();
                batch.update (db.collection ('Cardex').doc (pedido.id), {
                  'cliente_actual': update,
                });

                await batch.commit ();
              })
              .catch (e => {
                console.log ('error', e);
              });
            }
          }
        }
        // } else if (pedido.cliente_actual.orden > 0 && pedido.cliente_actual.orden < pedido.informacion_clientes.length) {
        //   const duracion: number = pedido.clientes [pedido.cliente_actual.orden].duracion;

        //   const hora_actual = admin.firestore.Timestamp.now ().toDate ();
        //   const hora_limite = pedido.clientes [pedido.cliente_actual.orden - 1].hora_fin_descarga.toDate ().setSeconds (duracion);

        //   const diferencia = calcular_diferencia (hora_actual, hora_limite);

        //   if (diferencia < 0) {
        //     const body: any = {
        //       'app_id': '44a9bc94-1355-4e1d-bda3-9b04a5c47316',
        //       'headings': {
        //         'en': 'Alerta de retraso',
        //         'es': 'Alerta de retraso'
        //       },
        //       'contents': {
        //         'en': `El conductor ${pedido.conductor_nombre} con el vehiculo ${pedido.vehiculo_alias} se encuentran retrasados en el pedido ${pedido.alias}`,
        //         'es': `El conductor ${pedido.conductor_nombre} con el vehiculo ${pedido.vehiculo_alias} se encuentran retrasados en el pedido ${pedido.alias}`,
        //       },
        //       'filters': [
        //         { "field": "tag", "key": 'Administrador', "relation": "exists" }
        //       ],
        //       'data': {
        //         'id': pedido.id
        //       }
        //     };

        //     if (pedido.cliente_actual.notificado === undefined || pedido.cliente_actual.notificado === false) {
        //       client.createNotification (body)
        //       .then (async (res: any) => {
        //         console.log ('res', res);

        //         let update = pedido.cliente_actual;
        //         update ['notificado'] = true;
        //         update ['notificado_hora'] = admin.firestore.Timestamp.now ();

        //         // Desactivar alerta
        //         const batch = db.batch ();
        //         batch.update (db.collection ('Cardex').doc (pedido.id), {
        //           'cliente_actual': update,
        //         });

        //         await batch.commit ();
        //       })
        //       .catch (e => {
        //         console.log ('error', e);
        //       });
        //     }
        //   }
        // }
      }
    });

    response.json ({
      estado: 'ok'
    });
  } catch (error){
    response.status (500).send (error);
  }
});

function calcular_diferencia (t1: any, t2: any) {
  let date1 = t1;
  let date2 = t2;

  let diffMs = 0;
  // let diffDays = 0;
  // let diffHrs = 0;
  let diffMins = 0;

  diffMs = (date2 - date1);
  // diffDays = Math.floor (diffMs / 86400000); // days
  // diffHrs = Math.floor ((diffMs % 86400000) / 3600000); // hours
  diffMins = Math.round (((diffMs % 86400000) % 3600000) / 60000); // minutes

  return diffMins;
}
