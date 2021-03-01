import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';
import { NbDialogService } from '@nebular/theme';
import * as moment from 'moment';

@Component({
  selector: 'ngx-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss']
})
export class HistorialComponent implements OnInit {
  @ViewChild('map', { static: false }) mapRef: ElementRef;
  map: any = null;
  marker_almacen: any = null;

  items: any [] = [];
  cliente_markers = new Map <string, any> ();
  esta_cargando: boolean = false;
  directionsService: any;
  directionsDisplay: any = null;

  nodo_tipo: string = 'Picking';
  constructor (
    private database: DatabaseService,
    private dialog: NbDialogService) { }

  ngOnInit () {
    this.directionsService = new google.maps.DirectionsService ();
    this.get_pedidos ();
  }

  get_pedidos () {
    this.database.get_todos_pedidos (this.nodo_tipo).subscribe ((res: any []) => {
      this.items = res;
    });
  }

  async ver (item: any, dialog: any) {
    this.esta_cargando = true;

    let subscribe = this.database.get_clientes_por_pedido (item.tipo, item.id).subscribe ((res: any []) => {
      subscribe.unsubscribe ();
      item.informacion_clientes = res;
      this.esta_cargando = false;

      console.log (item);

      this.dialog.open (dialog, {
        hasScroll: true,
        context: {
          item: item
        }
      });

      this.init_map (item);
    });
  }

  init_map (pedido: any) {
    let map_ref = document.getElementById ('map');
    let point_inicio = new google.maps.LatLng (-13.528726, -71.940001);

    const options = {
      center: point_inicio,
      zoom: 15,
      disableDefaultUI: true,
      streetViewControl: false,
      disableDoubleClickZoom: false,
      clickableIcons: false,
      scaleControl: true,
      mapTypeId: 'roadmap'
    }

    this.map = new google.maps.Map (map_ref, options);

    this.marker_almacen = new google.maps.Marker({
      position: point_inicio,
      animation: google.maps.Animation.DROP,
      icon: 'assets/img/icono almacen.png',
      map: this.map
    });

    // Eliminar
    this.cliente_markers.forEach ((value: any, key: string) => {
      this.cliente_markers.get (key).setMap (null);
      this.cliente_markers.delete (key);
    });

    if (this.directionsDisplay !== null) {
      this.directionsDisplay.setMap (null);
      this.directionsDisplay = null;
    }

    let waypoints: any [] = [];
    if (pedido.informacion_clientes instanceof Array) {
      pedido.informacion_clientes = pedido.informacion_clientes.sort ((a: any, b: any) => {
        if (a.orden > b.orden) {
          return 1;
        } else if (b.orden > a.orden) {
          return -1
        } else {
          return 0;
        }
      });

      pedido.informacion_clientes.forEach ((cliente: any) => {
        if (this.cliente_markers.get (cliente.id) === undefined) {
          let icon = 'assets/marker_usuario_asignado.png';
          if (cliente.tipo_descarga === 'completo') {
            icon = 'assets/marker_usuario_completado.png';
          } else if (cliente.tipo_descarga === 'rechazado') {
            icon = 'assets/marker_usuario_total.png';
          } else if (cliente.tipo_descarga === 'parcial') {
            icon = 'assets/marker_usuario_parcial.png';
          }

          let marker: any = new google.maps.Marker({
            position: new google.maps.LatLng (cliente.latitud, cliente.longitud),
            animation: google.maps.Animation.DROP,
            label: {
              text: (cliente.orden + 1).toString (),
              color: "black",
              fontWeight: 'bold',
              fontSize: '16px'
            },
            icon: icon,
            map: this.map
          });

          this.cliente_markers.set (cliente.id, marker);

          waypoints.push ({
            location: new google.maps.LatLng (cliente.latitud, cliente.longitud),
            stopover: true
          });
        }
      });

      let route = {
        origin: point_inicio,
        destination: point_inicio,
        waypoints: waypoints,
        optimizeWaypoints: false,
        language: 'es',
        travelMode: google.maps.TravelMode ['DRIVING']
      };

      this.directionsDisplay = new google.maps.DirectionsRenderer ({
        suppressMarkers: true
      });

      this.directionsDisplay.setMap (this.map);

      this.directionsService.route (route, (result: any, status: any) => {
        if (status == google.maps.DirectionsStatus.OK) {
          this.directionsDisplay.setDirections (result);
          console.log (result);
          pedido.routes = result [0];
        }
      });
    }
  }

  get_time_from_timestamp (fecha: any) {
    if (fecha === null) {
      return '--';
    }

    return moment (fecha, 'X').format ('h:mm a');
  }

  get_diferencia (cliente: any, pedido: any) {
    let date1;
    let date2;

    let diffMs = 0;
    let diffDays = 0;
    let diffHrs = 0;
    let diffMins = 0;

    if (cliente.orden <= 0) {
      if (pedido.hora_inicio_ruta === null || cliente.hora_llegada === null) {
        return '--';
      }

      date1 = pedido.hora_inicio_ruta.toDate ();
      date2 = cliente.hora_llegada.toDate ();

      diffMs = (date2 - date1);
      diffDays = Math.floor (diffMs / 86400000); // days
      diffHrs = Math.floor ((diffMs % 86400000) / 3600000); // hours
      diffMins = Math.round (((diffMs % 86400000) % 3600000) / 60000); // minutes
    } else if (cliente.orden > 0 && cliente.orden < pedido.informacion_clientes.length) {
      if (pedido.informacion_clientes [cliente.orden - 1].hora_fin_descarga === null || cliente.hora_llegada === null) {
        return '--';
      }

      date1 = pedido.informacion_clientes [cliente.orden - 1].hora_fin_descarga.toDate ();
      date2 = cliente.hora_llegada.toDate ();

      diffMs = (date2 - date1);
      diffDays = Math.floor (diffMs / 86400000); // days
      diffHrs = Math.floor ((diffMs % 86400000) / 3600000); // hours
      diffMins = Math.round (((diffMs % 86400000) % 3600000) / 60000); // minutes
    } else {
      // date1 = pedido.informacion_clientes [cliente.orden - 1].hora_fin_descarga.toDate ();
      // date2 = cliente.hora_llegada.toDate ();

      // diffMs = (date2 - date1);
      // diffDays = Math.floor (diffMs / 86400000); // days
      // diffHrs = Math.floor ((diffMs % 86400000) / 3600000); // hours
      // diffMins = Math.round (((diffMs % 86400000) % 3600000) / 60000); // minutes
    }

    return diffMins;
  }

  get_diferencia_timestamp (t1: any, t2: any) {
    if (t1 === null || t2 === null) {
      return '--';
    }

    let date1 = t1.toDate ();
    let date2 = t2.toDate ();

    let diffMs = 0;
    let diffDays = 0;
    let diffHrs = 0;
    let diffMins = 0;

    diffMs = (date2 - date1);
    diffDays = Math.floor (diffMs / 86400000); // days
    diffHrs = Math.floor ((diffMs % 86400000) / 3600000); // hours
    diffMins = Math.round (((diffMs % 86400000) % 3600000) / 60000); // minutes

    return diffMins;
  }

  get_numero_redondeado (val: number) {
    return Math.ceil (val);
  }

  eliminar (item: any) {
    if (confirm ("¿Esta seguro que desea realizar esta operacion?")) {
      console.log (item);

      this.database.eliminar_pedido (item)
        .then (() => {

        })
        .catch ((error: any) => {

        });
    }
  }
}
