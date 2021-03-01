import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';
import { NbToastrService } from '@nebular/theme';
import { NbDialogService } from '@nebular/theme';
import * as XLSX from 'ts-xlsx';

// Utils
import { first } from 'rxjs/operators';

declare var google: any;
import * as moment from 'moment';

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('map', { static: false }) mapRef: ElementRef;
  map: any = null;

  directionsService: any;
  directionsDisplay: any;

  carros: any [] = [];
  eventos_alertas_asusencia = new Map <string, any> ();
  eventos_alertas_rechazo_total = new Map <string, any> ();

  range: number = 120;
  alerta_loading: boolean = false;

  // Marcador de carros
  vehiculos_markers = new Map <string, any> ();
  rutas_display = new Map <string, any> ();
  rutas_polyline = new Map <string, any []> ();
  rutas_infowindows = new Map <string, any> ();
  rutas_info = new Map <string, any> ();
  cliente_markers = new Map <string, any []> ();
  marker_almacen: any = null;

  colors: any [] = ['#3689e6', '#28bca3', '#f37329', '#a56de2', '#c6262e'];
  horas: any [] = [
    // '00:00', '00:30',
    // '01:00', '01:30',
    // '02:00', '02:30',
    // '03:00', '03:30',
    // '04:00', '04:30',
    // '05:00', '05:30',
    '06:00', '06:30',
    '07:00', '07:30',
    '08:00', '08:30',
    '09:00', '09:30',
    '10:00', '10:30',
    '11:00', '11:30',
    '12:00', '12:30',
    '13:00', '13:30',
    '14:00', '14:30',
    '15:00', '15:30',
    '16:00', '16:30',
    '17:00', '17:30',
    '18:00', '18:30',
    '19:00', '19:30',
    '20:00', '20:30',
    '21:00', '21:30',
    '22:00', '22:30',
    '23:00', '23:30'
  ];
  constructor (
    private database: DatabaseService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService) { }

  reset () {
    this.carros = [];
    this.vehiculos_markers.clear ();
    this.rutas_display.clear ();
    this.rutas_polyline.clear ();
    this.rutas_infowindows.clear ();
    this.rutas_info.clear ();
    this.cliente_markers.clear ();
    this.marker_almacen.setMap (null);

    this.get_info ();
  }

  ngOnInit () {
    if (localStorage.getItem ('range') !== null) {
      this.range = parseInt (localStorage.getItem ('range'));
      this.carros.forEach ((carro: any) => {
        this.draw (carro);
      });
    }

    this.get_info ();
  }

  get_info () {
    this.vehiculos_markers = new Map <string, any> ();
    this.directionsService = new google.maps.DirectionsService ();

    this.database.get_vehiculos ().subscribe ((vehiculos: any []) => {
      this.init_map ();

      vehiculos.forEach ((vehiculo: any) => {
        if (vehiculo.visible === null || vehiculo.visible === undefined) {
          vehiculo.visible = true;
        }

        this.database.get_pedidos_por_vehiculo (vehiculo.id).subscribe ((pedidos: any []) => {
          let pedidos_validos: any [] = [];
          pedidos.forEach ((pedido: any) => {
            if (pedido.finalizado === false) {
              pedidos_validos.push (pedido);
            } else {
              if (this.rutas_display.get (vehiculo.id + '-' + pedido.id) !== undefined) {
                this.rutas_display.get (vehiculo.id + '-' + pedido.id).setMap (null);
                this.rutas_display.delete (vehiculo.id + '-' + pedido.id);
              }

              if (this.rutas_polyline.get (vehiculo.id + '-' + pedido.id) !== undefined) {
                this.rutas_polyline.get (vehiculo.id + '-' + pedido.id).forEach ((element: any) => {
                  element.setMap (null);
                });
                this.rutas_polyline.delete (vehiculo.id + '-' + pedido.id);
              }

              if (this.cliente_markers.get (vehiculo.id + '-' + pedido.id) !== undefined) {
                this.cliente_markers.get (vehiculo.id + '-' + pedido.id).forEach ((element: any) => {
                  element.setMap (null);
                });
                this.cliente_markers.delete (vehiculo.id + '-' + pedido.id);
              }
            }
          });
          vehiculo.pedidos = pedidos_validos;

          pedidos_validos.forEach ((pedido: any) => {
            this.database.get_eventos_by_picking_cardex (pedido.tipo ,pedido.id).subscribe ((res: any []) => {
              pedido.eventos = res;
            });

            this.database.get_clientes_by_picking_cardex (pedido.tipo, pedido.id).subscribe ((clientes: any []) => {
              pedido.informacion_clientes = clientes;

              clientes.forEach ((cliente: any) => {
                this.database.get_productos_pedido_cliente (pedido.tipo, pedido.id, cliente.id).subscribe ((res: any []) => {
                  cliente.productos = res;
                });
              });

              this.update_map (vehiculos);
            });
          });
        });
      });

      this.carros = vehiculos;
    });
  }

  get_min_width () {
    return this.range.toString () + 'px';
  }

  get_min_width_pista () {
    let returned = this.range * this.horas.length;
    return returned.toString () + 'px';
  }

  toggleVisible (vehiculo: any) {
    vehiculo.visible = !vehiculo.visible;

    if (this.vehiculos_markers.get (vehiculo.id) !== undefined) {
      if (vehiculo.visible) {
        this.vehiculos_markers.get (vehiculo.id).setMap (this.map);
      } else {
        this.vehiculos_markers.get (vehiculo.id).setMap (null);
      }
    }

    vehiculo.pedidos.forEach ((pedido: any) => {
      if (this.rutas_display.get (vehiculo.id + '-' + pedido.id) !== undefined) {
        if (vehiculo.visible) {
          this.rutas_display.get (vehiculo.id + '-' + pedido.id).setMap (this.map);
        } else {
          this.rutas_display.get (vehiculo.id + '-' + pedido.id).setMap (null);
        }
      }

      if (this.rutas_polyline.get (vehiculo.id + '-' + pedido.id) !== undefined) {
        if (vehiculo.visible) {
          this.rutas_polyline.get (vehiculo.id + '-' + pedido.id).forEach ((element: any) => {
            element.setMap (this.map);
          });
        } else {
          this.rutas_polyline.get (vehiculo.id + '-' + pedido.id).forEach ((element: any) => {
            element.setMap (null);
          });
        }
      }

      if (this.cliente_markers.get (vehiculo.id + '-' + pedido.id) !== undefined) {
        let map = this.map;
        if (vehiculo.visible === false) {
          map = null;
        }
        this.cliente_markers.get (vehiculo.id + '-' + pedido.id).forEach ((marker: any) => {
          marker.setMap (map);
        });
      }
    });
  }

  changeStatus (item: any) {
  }

  setMapOnAll (marker_list: any [], map: any) {
    for (var i = 0; i < marker_list.length; i++) {
      marker_list [i].setMap (map);
    }
  }

  init_map () {
    let point_inicio = new google.maps.LatLng (-13.585056, -71.804972);

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

    if (this.map === null) {
      this.map = new google.maps.Map (this.mapRef.nativeElement, options);
    }
  }

  update_map (vehiculos: any []) {
    let point_inicio = new google.maps.LatLng (-13.585056, -71.804972);

    if (this.marker_almacen === null) {
      this.marker_almacen = new google.maps.Marker({
        position: point_inicio,
        animation: google.maps.Animation.DROP,
        icon: 'assets/img/icono almacen.png',
        map: this.map
      });
    }

    vehiculos.forEach ((vehiculo: any) => {
      // Dibujamos las ruta de los vehiculos y si ya existe la actualizamos
      if (this.vehiculos_markers.get (vehiculo.id) === undefined) {
        let marker = new google.maps.Marker({
          position: new google.maps.LatLng (vehiculo.latitude, vehiculo.longitude),
          label: {
            text: vehiculo.alias,
            color: "black",
            fontWeight: 'bold',
            fontSize: '16px'
          },
          animation: google.maps.Animation.DROP,
          icon: 'assets/img/Icono carro.png',
          map: this.map
        });

        this.vehiculos_markers.set (vehiculo.id, marker);
      } else {
        let marker = this.vehiculos_markers.get (vehiculo.id);
        marker.setPosition (new google.maps.LatLng (vehiculo.latitude, vehiculo.longitude));
      }

      // Dibujamos la ruta de los pedidos
      vehiculo.pedidos.forEach ((pedido: any) => {
        if (this.rutas_display.get (vehiculo.id + '-' + pedido.id) === undefined) {
          let point_inicio = new google.maps.LatLng (-13.585056, -71.804972);
          let waypoints: any [] = [];

          if (pedido.informacion_clientes instanceof Array) {
            pedido.informacion_clientes.forEach ((cliente: any) => {
              let icon = 'assets/marker_usuario_asignado.png';
              if (cliente.tipo_descarga === 'completo') {
                icon = 'assets/marker_usuario_completado.png';
              } else if (cliente.tipo_descarga === 'rechazado') {
                icon = 'assets/marker_usuario_total.png';
              } else if (cliente.tipo_descarga === 'parcial') {
                icon = 'assets/marker_usuario_parcial.png';
              }

              let marker: any = new google.maps.Marker ({
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

              marker.info = new google.maps.InfoWindow ();
              marker.cliente_id = cliente.id;

              google.maps.event.addListener (marker, 'mouseover', () => {
                marker.info.setContent (this.get_cliente_info (cliente, vehiculo, pedido));
                marker.info.open (this.map, marker);
              });

              marker.addListener ('mouseout', () => {
                marker.info.close ();
              });

              if (this.cliente_markers.get (vehiculo.id + '-' + pedido.id) === undefined) {
                this.cliente_markers.set (vehiculo.id + '-' + pedido.id, [marker]);
              } else {
                this.cliente_markers.get (vehiculo.id + '-' + pedido.id).push (marker);
              }

              waypoints.push ({
                location: new google.maps.LatLng (cliente.latitud, cliente.longitud),
                stopover: true
              });
            });

            let route = {
              origin: point_inicio,
              destination: point_inicio,
              waypoints: waypoints,
              optimizeWaypoints: true,
              language: 'es',
              travelMode: google.maps.TravelMode ['DRIVING']
            };

            var directionsDisplay = new google.maps.DirectionsRenderer ({
              suppressMarkers: true,
              suppressPolylines: true
            });

            let polylineOptions = {
              strokeColor: this.colors [this.getRandomInt (0, this.colors.length)],
              strokeOpacity: 0.7,
              strokeWeight: 5
            }

            directionsDisplay.setMap (this.map);
            this.directionsService.route (route, (result: any, status: any) => {
              if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections (result);

                var step = Math.floor (result.routes[0].legs[0].steps.length / 2);
                var infowindow2 = new google.maps.InfoWindow ();
                infowindow2.setContent (this.get_pedido_porcentaje (vehiculo, pedido));
                infowindow2.setPosition (result.routes[0].legs[0].steps[step].end_location);

                this.rutas_infowindows.set (vehiculo.id + '-' + pedido.id, infowindow2);
                this.rutas_info.set (vehiculo.id + '-' + pedido.id, result)
                this.renderDirectionsPolylines (result, polylineOptions, vehiculo, pedido);

                if (this.rutas_infowindows.get (vehiculo.id + '-' + pedido.id) !== undefined) {
                  this.rutas_infowindows.get (vehiculo.id + '-' + pedido.id).setContent (this.get_pedido_porcentaje (vehiculo, pedido));
                }
              }
            });

            this.rutas_display.set (vehiculo.id + '-' + pedido.id, directionsDisplay);
          }
        } else {
          if (pedido.informacion_clientes instanceof Array) {
            pedido.informacion_clientes.forEach ((cliente: any) => {
              // if (this.cliente_markers.get (vehiculo.id + '-' + pedido.id + '-' + cliente.id) !== undefined) {
              //   let icon = 'assets/marker_usuario_asignado.png';
              //   if (cliente.tipo_descarga === 'completo') {
              //     icon = 'assets/marker_usuario_completado.png';
              //   } else if (cliente.tipo_descarga === 'rechazado') {
              //     icon = 'assets/marker_usuario_total.png';
              //   } else if (cliente.tipo_descarga === 'parcial') {
              //     icon = 'assets/marker_usuario_parcial.png';
              //   }

              //   this.cliente_markers.get (vehiculo.id + '-' + pedido.id + '-' + cliente.id).setIcon (icon);
              // }
            });
          }

          if (this.rutas_infowindows.get (vehiculo.id + '-' + pedido.id) !== undefined) {
            this.rutas_infowindows.get (vehiculo.id + '-' + pedido.id).setContent (this.get_pedido_porcentaje (vehiculo, pedido));
          }
        }
      });
    });
  }

  get_cliente_info (cliente: any, vehiculo: any, pedido: any) {
    let kilometros: number = 0;
    let duracion: number = 0;
    if (this.rutas_info.get (vehiculo.id + '-' + pedido.id) !== undefined) {
      kilometros = this.rutas_info.get (vehiculo.id + '-' + pedido.id).routes [0].legs [cliente.orden].distance.value
      duracion = this.rutas_info.get (vehiculo.id + '-' + pedido.id).routes [0].legs [cliente.orden].duration.value
    }
    return `
      <b>Nombre:</b> ${cliente.cliente_nombre}<br/>
      <b>Direccion:</b> ${cliente.cliente_direccion}<br/>
      <b>Kilometros:</b> ${(kilometros / 1000).toFixed (1)} km<br/>
      <b>Duracion:</b> ${(duracion / 60).toFixed (2)} min<br/>
      <b>Estado:</b> ${this.get_cliente_estado_format (cliente.estado)}
    `;
  }

  get_cliente_estado_format (estado: string) {
    if (estado === 'asignado') {
      return 'Asignado';
    } else if (estado === 'finalizado') {
      return 'Finalizado';
    } else if (estado === 'llego') {
      return 'Esperando descarga';
    } else if (estado === 'descargando') {
      return 'Descargando';
    } else if (estado === 'ausente') {
      return 'Ausente'
    } else if (estado === 'pendiente_rechazo_total') {
      return 'Rechazo total'
    } else {
      return '';
    }
  }

  get_pedido_porcentaje (vehiculo: any, pedido: any) {
    if (pedido.informacion_clientes instanceof Array) {
      let total: any = pedido.informacion_clientes.length;
      let finalizados: number = 0;
      pedido.informacion_clientes.forEach ((cliente: any) => {
        if (cliente.estado === 'finalizado') {
          finalizados++;
        }
      });

      return `
        <b>Nombre:</b> ${pedido.alias}<br/>
        <b>Avance:</b> ${(finalizados / total * 100).toFixed (0)}%<br/>
        <b>Conductor:</b> ${pedido.conductor_nombre}<br/>
        <b>Estado:</b> ${this.get_estado_format (pedido.estado)}<br/>
        <b>Kilometros:</b> ${this.get_kilometros_total (vehiculo.id + '-' + pedido.id)}<br/>
        <b>Duracion:</b> ${this.get_duracion_total (vehiculo.id + '-' + pedido.id)}
      `;
    }

    return '';
  }

  get_duracion_total (id: string) {
    if (this.rutas_info.get (id) !== undefined) {
      let duracion: any = 0;
      this.rutas_info.get (id).routes [0].legs.forEach ((ruta: any) => {
        duracion += ruta.duration.value;
      });

      return (duracion / 60).toFixed (2).toString () + ' min';
    }

    return '0 min';
  }

  get_kilometros_total (id: string) {
    if (this.rutas_info.get (id) !== undefined) {
      let kilometros: any = 0;
      console.log (this.rutas_info.get (id));

      this.rutas_info.get (id).routes [0].legs.forEach ((ruta: any) => {
        kilometros += ruta.distance.value;
      });

      return (kilometros / 1000).toFixed (1).toString () + ' km';
    }

    return '0 km';
  }

  get_estado_format (estado: any) {
    if (estado === 'asignado') {
      return 'Asignado';
    } else if (estado === 'cargando') {
      return 'Cargando desde almacen';
    } else if (estado === 'fin_de_carga') {
      return 'Carga finalizada, esperando inicio de ruta';
    } else if (estado === 'en_ruta') {
      return 'En ruta';
    } else if (estado === 'esperando_cliente') {
      return 'Esperando cliente';
    } else if (estado === 'descargando') {
      return 'Descargando mercaderia cliente'
    } else if (estado === 'camino_almacen') {
      return 'En camino a almacen';
    } else if (estado === 'finalizado') {
      return 'Ruta finalizada';
    } else if (estado === 'fin_ruta') {
      return 'Ruta finalizada';
    } else {
      return '';
    }
  }

  renderDirectionsPolylines (response: any, polylineOptions: any, vehiculo: any, pedido: any) {
    let polylines = [];
    for (let i = 0; i < polylines.length; i++) {
      polylines[i].setMap (null);
    }
    var legs = response.routes[0].legs;
    for (let i = 0; i < legs.length; i++) {
      var steps = legs[i].steps;
      for (let j = 0; j < steps.length; j++) {
        var nextSegment = steps[j].path;
        var stepPolyline = new google.maps.Polyline (polylineOptions);
        for (let k = 0; k < nextSegment.length; k++) {
          stepPolyline.getPath ().push (nextSegment[k]);
        }
        polylines.push (stepPolyline);
        stepPolyline.setMap (this.map);

        // route click listeners, different one on each step
        google.maps.event.addListener (stepPolyline, 'click', (event: any) => {
          if (this.rutas_infowindows.get (vehiculo.id + '-' + pedido.id) !== undefined) {
            this.rutas_infowindows.get (vehiculo.id + '-' + pedido.id).open (this.map);
          }
        });

        if (this.rutas_polyline.get (vehiculo.id + '-' + pedido.id) === undefined) {
          this.rutas_polyline.set (vehiculo.id + '-' + pedido.id, [stepPolyline]);
        } else {
          this.rutas_polyline.get (vehiculo.id + '-' + pedido.id).push (stepPolyline);
        }
      }
    }
  }

  getRandomInt (min: number, max: number) {
    min = Math.ceil (min);
    max = Math.floor (max);
    return Math.floor (Math.random() * (max - min + 1)) + min;
  }

  draw (carro: any) {
    if (carro.pedidos instanceof Array) {
      carro.pedidos.forEach ((item: any) => {
        let inicio_carga = document.getElementById ('inicio_carga_' + item.id);
        if (inicio_carga !== null) {
          if (item.hora_fin_carga === null) {
            inicio_carga.setAttribute ('style', 'position: absolute; height: 45px; background-color: #F0F0F0; left: ' + this.get_pixeles (this.timestamp_to_date (item.hora_inicio_carga)) + 'px;');
          } else {
            inicio_carga.setAttribute ('style', 'position: absolute; height: 45px; background-color: #F0F0F0; min-width:' + this.ge_width (this.timestamp_to_date (item.hora_inicio_carga), this.timestamp_to_date (item.hora_fin_carga)) + 'px;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (item.hora_inicio_carga)) + 'px; background-image: url("assets/img/inicio_carga.png"); background-size: auto; background-position: center; background-repeat: no-repeat');
          }
        }

        let fin_carga = document.getElementById ('fin_carga_' + item.id);
        if (fin_carga !== null) {
          fin_carga.setAttribute('style', 'position: absolute;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (item.hora_fin_carga)) + 'px;');
        }

        let inicio_ruta = document.getElementById ('hora_inicio_ruta_' + item.id);
        if (inicio_ruta !== null) {
          inicio_ruta.setAttribute('style', 'position: absolute;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (item.hora_inicio_ruta)) + 'px;');
        }

        // let ultimo_cliente = document.getElementById ('ultimo_cliente_hora_' + item.id);
        // if (ultimo_cliente !== null) {
        //   if (item.hora_fin_ruta === null) {
        //     ultimo_cliente.setAttribute ('style', 'position: absolute; height: 45px; background-color: #F0F0F0; min-width: ' + this.ge_width (this.timestamp_to_date (item.ultimo_cliente_hora), this.timestamp_to_date (item.hora_llegada_almacen)) + 'px;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (item.ultimo_cliente_hora)) + 'px');
        //   } else {
        //     ultimo_cliente.setAttribute ('style', 'position: absolute; height: 45px; background-color: #F0F0F0; min-width: ' + this.ge_width (this.timestamp_to_date (item.ultimo_cliente_hora), this.timestamp_to_date (item.hora_fin_ruta)) + 'px;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (item.ultimo_cliente_hora)) + 'px');
        //   }
        // }

        let hora_fin_ruta = document.getElementById ('hora_fin_ruta_' + item.id);
        if (hora_fin_ruta !== null) {
          hora_fin_ruta.setAttribute('style', 'position: absolute;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (item.hora_fin_ruta)) + 'px;');
        }

        let llegada_almacen = document.getElementById ('hora_llegada_almacen_' + item.id);
        if (llegada_almacen !== null) {
          if (item.hora_fin_ruta === null) {
            llegada_almacen.setAttribute ('style', 'position: absolute; height: 45px; background-color: #F0F0F0; left: ' + this.get_pixeles (this.timestamp_to_date (item.hora_llegada_almacen)) + 'px;');
          } else {
            llegada_almacen.setAttribute ('style', 'position: absolute; height: 45px; background-color: #F0F0F0; min-width:' + this.ge_width (this.timestamp_to_date (item.hora_llegada_almacen), this.timestamp_to_date (item.hora_fin_ruta)) + 'px;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (item.hora_llegada_almacen)) + 'px; background-image: url("assets/img/Grupo 14.png"); background-size: auto; background-position: center; background-repeat: no-repeat');
          }
        }

        if (item.informacion_clientes instanceof Array) {
          item.informacion_clientes.forEach ((cliente: any) => {
            let hora_llegada = document.getElementById ('hora_llegada_' + item.id + '_' + cliente.id);
            if (hora_llegada !== null) {
              if (cliente.hora_fin_descarga === null) {
                hora_llegada.setAttribute ('style', 'position: absolute; height: 45px;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (cliente.hora_llegada)) + 'px;');
              } else {
                hora_llegada.setAttribute ('style', 'position: absolute; height: 45px; background-color: #F0F0F0; min-width: ' + this.ge_width (this.timestamp_to_date (cliente.hora_llegada), this.timestamp_to_date (cliente.hora_fin_descarga)) + 'px;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (cliente.hora_llegada)) + 'px');
              }
            }

            let hora_rechazo_total = document.getElementById ('hora_rechazo_total_' + item.id + '_' + cliente.id);
            if (hora_rechazo_total !== null) {
              hora_rechazo_total.setAttribute('style', 'position: absolute;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (cliente.hora_rechazo_total)) + 'px;');
            }
            let hora_ausencia = document.getElementById ('hora_ausencia_' + item.id + '_' + cliente.id);
            if (hora_ausencia !== null) {
              hora_ausencia.setAttribute('style', 'position: absolute;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (cliente.hora_ausencia)) + 'px;');
            }

            let hora_inicio_descarga = document.getElementById ('hora_inicio_descarga_' + item.id + '_' + cliente.id);
            if (hora_inicio_descarga !== null) {
              hora_inicio_descarga.setAttribute('style', 'position: absolute;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (cliente.hora_inicio_descarga)) + 'px;');
            }

            let hora_fin_descarga = document.getElementById ('hora_fin_descarga_' + item.id + '_' + cliente.id);
            if (hora_fin_descarga !== null) {
              hora_fin_descarga.setAttribute('style', 'position: absolute;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (cliente.hora_fin_descarga)) + 'px;');
            }
          });
        }

        if (item.eventos instanceof Array) {
          item.eventos.forEach ((evento: any) => {
            if (evento.tipo === 'recarga_combustible') {
              let _evento = document.getElementById ('evento_' + evento.id);
              _evento.setAttribute ('style', 'position: absolute; height: 45px; left: ' + this.get_pixeles (evento.hora_inicio) + 'px;');
            } else {
              let hora_inicio = document.getElementById ('evento_inicio_' + evento.id);

              if (hora_inicio !== null) {
                if (evento.hora_fin === null) {
                  hora_inicio.setAttribute('style', 'position: absolute; height: 45px; background-color: #F0F0F0; left: ' + this.get_pixeles (evento.hora_inicio) + 'px;');
                } else {
                  let evento_imagen: string = '';
                  if (evento.tipo === 'almuerzo') {
                    evento_imagen = 'assets/img/almuerzo_placeholder.png'
                  } else if (evento.tipo === 'accidente') {
                    evento_imagen = 'assets/img/accidente_placeholder.png'
                  } else if (evento.tipo === 'fallo_mecanico') {
                    evento_imagen = 'assets/img/fallo_mecanico_placeholder.png'
                  }

                  hora_inicio.setAttribute('style', 'position: absolute; height: 45px; background-color: #F0F0F0; min-width:' + this.ge_width (evento.hora_inicio, evento.hora_fin) + 'px;' + 'left: ' + this.get_pixeles (evento.hora_inicio) + 'px; background-image: url("'+ evento_imagen + '"); background-size: auto; background-position: center; background-repeat: no-repeat');
                }
              }

              let hora_fin = document.getElementById ('evento_fin_' + evento.id);
              if (hora_fin !== null) {
                hora_fin.setAttribute('style', 'position: absolute;' + 'left: ' + this.get_pixeles (evento.hora_fin) + 'px;');
              }
            }
          });
        }
      });
    }
  }

  range_changed () {
    localStorage.setItem ('range', this.range.toString ());
    this.carros.forEach ((carro: any) => {
      this.draw (carro);
    });
  }

  timestamp_to_date (timestamp: any) {
    try {
      let hora = timestamp.toDate ().getHours ();
      let minutos = timestamp.toDate ().getMinutes ();
      let segundos =  timestamp.toDate ().getSeconds ();
      if (minutos.toString ().length <= 1) {
        minutos = '0' + minutos.toString ();
      } else {
        minutos = minutos.toString ();
      }

      if (segundos.toString ().length <= 1) {
        segundos = '0' + segundos.toString ();
      } else {
        segundos = segundos.toString ();
      }

      return hora + ':' + minutos + ':' + segundos;
    } catch (error) {
      return "";
    }
  }

  get_pixeles (hora: any) {
    try {
      let h = parseInt (hora.split (":") [0]);
      let m = parseInt (hora.split (":") [1]);
      let s = parseInt (hora.split (":") [2]);

      return ((h - 6) * this.range * 2) + ((m / 60) * this.range * 2);
    } catch (error) {
      return 0;
    }
  }

  ge_width (hora_llegada: string, hora_fin_descarga: string) {
    try {
      let h1 = parseInt (hora_llegada.split (":") [0]);
      let m1 = parseInt (hora_llegada.split (":") [1]);

      let h2 = parseInt (hora_fin_descarga.split (":") [0]);
      let m2 = parseInt (hora_fin_descarga.split (":") [1]);

      return (((((h2 * 60) + m2) - ((h1 * 60) + m1)) * this.range) / 30);
    } catch (error) {
      return 0;
    }
  }

  get_icon (tipo_descarga: string) {
    if (tipo_descarga === 'completo') {
      return 'assets/img/fin_descarga_exitosa.svg'
    } else if (tipo_descarga === 'parcial') {
      return 'assets/img/chazo_parcial.svg'
    } else if (tipo_descarga === 'rechazado') {
      return 'assets/img/rechazo_total.svg'
    }
  }

  click_alert (dialog: any, pedido: any, cliente: any) {
    this.dialogService.open (dialog, {
      closeOnBackdropClick: false,
      context: {
        cardex: pedido,
        cliente: cliente
      }
    });
  }

  desbloquear_pedido (data: any, ref: any) {
    if (confirm ('¿Seguro?')) {
      console.log (data);
      this.alerta_loading = true;

      this.database.desbloquear_rechazo_total_cliente (data.cardex.tipo, data.cardex.id, data.cliente.id)
      .then (() => {
        this.eliminar_evento_clientes (data.cliente);
        this.alerta_loading = false;
        ref.close ()
      })
      .catch ((error: any) => {
        console.log (error);
        this.alerta_loading = false;
        ref.close ();
      });
    }
  }

  async cancelar_pedido (data: any, ref: any) {
    if (confirm ('Seguro?')) {
      this.alerta_loading = true;
      let clientes = await this.database._get_clientes_by_cardex (data.cardex.tipo, data.cardex.id).pipe (first ()).toPromise ();

      let cliente_actual_id = data.cardex.cliente_actual.id;
      let cliente_siguiente = clientes [data.cardex.cliente_actual.orden + 1];

      if (cliente_siguiente !== null && cliente_siguiente !== undefined) {
        data.cardex.cliente_actual.id = cliente_siguiente.id;
        data.cardex.cliente_actual.nombre = cliente_siguiente.cliente_nombre;
        data.cardex.cliente_actual.orden = cliente_siguiente.orden;

        // console.log (data.cardex);
        this.database.update_cardex (data.cardex.tipo, data.cardex)
          .then (async () => {
            ref.close ();
            this.eliminar_evento_clientes (data.cliente);
            this.alerta_loading = false;
            // Actualizamos sucrpćion
            this.database.update_cliente_estado (data.cardex.tipo, data.cardex, cliente_actual_id);
          }).catch (async (error: any) => {
            console.log (error);
          });
      } else {
        // if (data.cardex.numero_total_rechazos_totales > 0 || data.cardex.numero_total_rechazos_parciales > 0) {
        //   data.cardex.estado = 'camino_almacen';
        // } else {
        //   data.cardex.estado = 'fin_ruta';
        // }

        // this.database.update_cardex ('Picking', data.cardex)
        //   .then (async () => {
        //     ref.close ();
        //   }).catch (async (error: any) => {
        //     console.log (error);
        //   });
      }
    }
  }

  cerrar_alerta_modal (ref: any, data: any) {
    ref.close ();
  }

  show_eventos_alerta (dialog: any, pedido: any, cliente: any) {
    if (cliente.hora_ausencia !== null && cliente.estado === 'ausente') {
      if (this.eventos_alertas_asusencia.get (cliente.id) === undefined) {
        this.eventos_alertas_asusencia.set (cliente.id, {pedido: pedido, cliente: cliente});
      }
    } else {
      if (this.eventos_alertas_asusencia.get (cliente.id) !== undefined) {
        this.eventos_alertas_asusencia.delete (cliente.id);
      }
    }

    if (cliente.hora_rechazo_total !== null && cliente.estado === 'pendiente_rechazo_total') {
      if (this.eventos_alertas_rechazo_total.get (cliente.id) === undefined) {
        this.eventos_alertas_rechazo_total.set (cliente.id, {pedido: pedido, cliente: cliente});
      }
    } else {
      if (this.eventos_alertas_rechazo_total.get (cliente.id) !== undefined) {
        this.eventos_alertas_rechazo_total.delete (cliente.id);
      }
    }
  }

  eliminar_evento_clientes (cliente: any) {
    this.eventos_alertas_asusencia.delete (cliente.id);
    this.eventos_alertas_rechazo_total.delete (cliente.id);
  }

  ver_alerta (dialog: any, pedido: any, cliente: any) {
    console.log (cliente);
    this.click_alert (dialog, pedido, cliente);
  }

  ver_detalle_pedido (dialog: any, cliente: any) {
    this.dialogService.open (dialog, {
      context: {
        cliente: cliente
      }
    })
  }

  get_motivo (evento: any) {
    if (evento.motivo === '') {
      return '';
    }

    return ', Motivo: ' + evento.motivo;
  }
}
