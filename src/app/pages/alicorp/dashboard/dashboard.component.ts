import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';
import { NbDialogService } from '@nebular/theme';
import * as XLSX from 'ts-xlsx';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { CompileShallowModuleMetadata } from '@angular/compiler';

declare var google: any;
import * as moment from 'moment';

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChild('map', { static: false }) mapRef: ElementRef;
  map: any;

  directionsService: any;
  directionsDisplay: any;

  clientes_picking: any [] = [];

  carros: any [] = [];

  // carros: any [] = [
  //   {
  //     nombre_conductor_responsable: 'Jose',
  //     vehiculo: 'Vehiculo 01',
  //     pedidos: [
  //       {
  //         id: 'gglr7nazbpjt',
  //         hora_inicio_carga: '08:10',
  //         hora_inicio_ruta: '09:00',
  //         hora_fin_ruta: '13:15',
  //         hora_fin_carga: '',
  //         informacion_clientes: [
  //           {
  //             id: 'cuyaat6yg3n8',
  //             hora_llegada_estimada: '09:45',
  //             hora_llegada: '10:00',
  //             hora_inicio_descarga: '10:15',
  //             hora_fin_descarga: '10:30',
  //             tipo_descarga: 'completo'
  //           },
  //           {
  //             id: 'w0akpu4yyuns',
  //             hora_llegada_estimada: '11:00',
  //             hora_llegada: '11:00',
  //             hora_inicio_descarga: '11:08',
  //             hora_fin_descarga: '12:00',
  //             tipo_descarga: 'parcial'
  //           },
  //           {
  //             id: 'pfmedtrazxne',
  //             hora_llegada_estimada: '12:30',
  //             hora_llegada: '12:25',
  //             hora_inicio_descarga: '12:30',
  //             hora_fin_descarga: '13:10',
  //             tipo_descarga: 'rechazado'
  //           }
  //         ]
  //       },
  //       {
  //         id: 'hbneveqysuib',
  //         hora_inicio_carga: '14:00',
  //         hora_inicio_ruta: '14:30',
  //         hora_fin_ruta: '18:00',
  //         hora_fin_carga: '',
  //         informacion_clientes: [
  //           {
  //             id: 'gzaxchkowmsq',
  //             hora_llegada_estimada: '15:00',
  //             hora_llegada: '15:00',
  //             hora_inicio_descarga: '15:15',
  //             hora_fin_descarga: '15:30',
  //             tipo_descarga: 'completo'
  //           },
  //           {
  //             id: 'rujfwohdjwdd',
  //             hora_llegada_estimada: '16:00',
  //             hora_llegada: '16:00',
  //             hora_inicio_descarga: '16:25',
  //             hora_fin_descarga: '16:45',
  //             tipo_descarga: 'completo'
  //           },
  //           {
  //             id: 'yjgvmdmkeyyn',
  //             hora_llegada_estimada: '17:10',
  //             hora_llegada: '17:13',
  //             hora_inicio_descarga: '17:20',
  //             hora_fin_descarga: '17:35',
  //             tipo_descarga: 'rechazado'
  //           }
  //         ]
  //       }
  //     ],
  //     eventos: [
  //       {
  //         id: 'rlpasgbmwrsw',
  //         nombre: 'Accidente',
  //         tipo: 'accidente',
  //         hora_inicio: '09:30',
  //         hora_fin: '09:45'
  //       }
  //     ]
  //   },
  //   {
  //     nombre_conductor_responsable: 'Alain',
  //     vehiculo: 'Vehiculo 02',
  //     pedidos: [
  //     ],
  //     eventos: [

  //     ]
  //   }
  // ];

  constructor (
    private database: DatabaseService,
    private dialogService: NbDialogService) { }

  ngOnInit() {
    this.database.get_vehiculos ().subscribe ((res: any) => {
      res.forEach ((carro: any) => {
        this.database.get_pedidos_por_vehiculo (carro.id).subscribe ((pedidos: any []) => {
          carro.pedidos = pedidos;
          pedidos.forEach ((pedido: any) => {
            this.database.get_eventos_by_cardex (pedido.id).subscribe ((res: any []) => {
              pedido.eventos = res;
            });

            this.database.get_clientes_by_cardex (pedido.id).subscribe ((res: any []) => {
              pedido.informacion_clientes = res;
            });
          });
        });
      });

      console.log (res);
      this.carros = res;
    });

    setTimeout(() => {
      this.init_map ();
    }, 500);
  }

  init_map () {
    let point_inicio = new google.maps.LatLng (-13.528726, -71.940001);

    // let infowindow = new google.maps.InfoWindow ();

    // this.directionsService = new google.maps.DirectionsService;
    // this.directionsDisplay = new google.maps.DirectionsRenderer({
    //   suppressPolylines: true,
    //   suppressMarkers: true,
    //   infoWindow: infowindow
    // });

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

    this.map = new google.maps.Map (this.mapRef.nativeElement, options);

    //this.directionsDisplay.setMap (this.map);

    // let waypoints: any [] = [];
    // this.clientes_picking.forEach ((cliente: any) => {
    //   waypoints.push ({
    //     location: new google.maps.LatLng (cliente.cliente.latitud, cliente.cliente.longitud),
    //     stopover: true
    //   });
    // });

    // let request = {
    //   origin: point_inicio,
    //   destination: point_inicio,
    //   waypoints: waypoints,
    //   optimizeWaypoints: true,
    //   provideRouteAlternatives: true,
    //   travelMode: google.maps.TravelMode ['DRIVING']
    // }

    // this.directionsService.route (request, (response: any, status: any) => {
    //   if (status == 'OK') {
    //     this.directionsDisplay.setOptions({
    //       directions: response,
    //     });

    //     console.log ('Respuesta', response);

    //     let polylineOptions = {
    //       strokeColor: '#C83939',
    //       strokeOpacity: 1,
    //       strokeWeight: 4
    //     };
    //     let colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];
    //     let polylines = [];

    //     var bounds = new google.maps.LatLngBounds();
    //     for (var i = 0; i < polylines.length; i++) {
    //       polylines[i].setMap(null);
    //     }
    //     var legs = response.routes[0].legs;
    //     for (let i = 0; i < legs.length; i++) {
    //       var steps = legs[i].steps;
    //       for (let j = 0; j < steps.length; j++) {
    //         var nextSegment = steps[j].path;
    //         var stepPolyline = new google.maps.Polyline(polylineOptions);
    //         stepPolyline.setOptions({
    //           strokeColor: colors[i]
    //         })
    //         for (let k = 0; k < nextSegment.length; k++) {
    //           stepPolyline.getPath().push(nextSegment[k]);
    //           bounds.extend(nextSegment[k]);
    //         }
    //         polylines.push(stepPolyline);
    //         stepPolyline.setMap(this.map);
    //         // route click listeners, different one on each step
    //         google.maps.event.addListener(stepPolyline, 'click', (evt: any) => {
    //           infowindow.setContent("you clicked on the route<br>" + evt.latLng.toUrlValue(6));
    //           infowindow.setPosition(evt.latLng);
    //           infowindow.open(this.map);
    //         });
    //       }
    //     }

    //     this.map.fitBounds(bounds);

    //     let marker = new google.maps.Marker({
    //       position: point_inicio,
    //       label: '1',
    //       map: this.map
    //     });

    //     let count: number = 2;
    //     console.log ('Orden de ruta:');
    //     response.routes [0].waypoint_order.forEach((element: number) => {
    //       console.log (count + ': ', this.clientes_picking [element]);
    //       let marker = new google.maps.Marker({
    //         position: waypoints [element].location,
    //         label: count.toString (),
    //         map: this.map
    //       });

    //       count++;
    //     });
    //   }
    // });
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
            let hora_llegada = document.getElementById ('hora_llegada_' + cliente.id);
            if (hora_llegada !== null) {
              if (cliente.hora_fin_descarga === null) {
                hora_llegada.setAttribute ('style', 'position: absolute; height: 45px;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (cliente.hora_llegada)) + 'px;');
              } else {
                hora_llegada.setAttribute ('style', 'position: absolute; height: 45px; background-color: #F0F0F0; min-width: ' + this.ge_width (this.timestamp_to_date (cliente.hora_llegada), this.timestamp_to_date (cliente.hora_fin_descarga)) + 'px;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (cliente.hora_llegada)) + 'px');
              }
            }

            let hora_inicio_descarga = document.getElementById ('hora_inicio_descarga_' + cliente.id);
            if (hora_inicio_descarga !== null) {
              hora_inicio_descarga.setAttribute('style', 'position: absolute;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (cliente.hora_inicio_descarga)) + 'px;');
            }

            let hora_fin_descarga = document.getElementById ('hora_fin_descarga_' + cliente.id);
            if (hora_fin_descarga !== null) {
              hora_fin_descarga.setAttribute('style', 'position: absolute;' + 'left: ' + this.get_pixeles (this.timestamp_to_date (cliente.hora_fin_descarga)) + 'px;');
            }
          });
        }

        if (item.eventos instanceof Array) {
          item.eventos.forEach ((evento: any) => {
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
          });
        }
      });
    }
  }

  timestamp_to_date (timestamp: any) {
    try {
      let hora = timestamp.toDate ().getHours ();
      let minutos = timestamp.toDate ().getMinutes ();
      if (minutos.toString ().length <= 1) {
        minutos = '0' + minutos.toString ();
      } else {
        minutos = minutos.toString ();
      }

      return hora + ':' + minutos;
    } catch (error) {
      return "";
    }
  }

  get_pixeles (hora: any) {
    try {
      let h = parseInt (hora.split (":") [0]); // 8
      let m = parseInt (hora.split (":") [1]); // 30

      //1200 + 36
      return ((h - 8) * 240) + ((m / 60) * 240);
    } catch (error) {
      return 0;
    }
  }

  ge_width (hora_llegada: string, hora_fin_descarga: string) {
    try {
      let h1 = parseInt (hora_llegada.split (":") [0]); // 11 675
      let m1 = parseInt (hora_llegada.split (":") [1]); // 15

      let h2 = parseInt (hora_fin_descarga.split (":") [0]); // 12 720
      let m2 = parseInt (hora_fin_descarga.split (":") [1]); // 00

      return (((((h2 * 60) + m2) - ((h1 * 60) + m1)) * 120) / 30);
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
}
