import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';
import { NbDialogService } from '@nebular/theme';
import { Router } from '@angular/router';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

// Search Provider
import { environment } from '../../../../environments/environment';
import * as moment from 'moment';
const algoliasearch = require('algoliasearch');
import * as XLSX from 'xlsx';
import { zip } from 'rxjs';
import { timeStamp } from 'console';
import { color } from 'd3-color';

@Component({
  selector: 'ngx-agregar-picking',
  templateUrl: './agregar-picking.component.html',
  styleUrls: ['./agregar-picking.component.scss']
})
export class AgregarPickingComponent implements OnInit {
  @ViewChild('map', { static: false }) mapRef: ElementRef;
  map: any;
  directionsDisplay: any;
  directionsService: any;

  cargando: boolean = false;
  carga_ruta: boolean = false;
  primera_carga: boolean = false;

  transportes: any [] = [];
  clientes: any [] = [];
  _clientes: any [] = [];
  terminal_clientes: any [] = [];
  directions_display: any [] = [];
  markers: any [] = [];
  choferes: any [] = [];
  vehiculos: any [] = [];
  constructor (
    private database: DatabaseService,
    private dialogService: NbDialogService,
    private router: Router
  ) { }

  ngOnInit() {
    this.database.get_terminal_clientes ().subscribe ((res: any []) => {
      this.terminal_clientes = res;
    });

    this.database.get_usuarios_by_tipo (3).subscribe ((res: any) => {
      this.choferes = res;
      console.log ('terminal_clientes', res);
    });

    this.database.get_vehiculos ().subscribe ((res: any) => {
      this.vehiculos = res;
    });

    setTimeout(() => {
      this.init_map ();
    }, 1000);
  }

  init_map () {
    this.directionsService = new google.maps.DirectionsService ();
    this.directionsDisplay = new google.maps.DirectionsRenderer ();

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
    };

    this.map = new google.maps.Map (this.mapRef.nativeElement, options);
    this.directionsDisplay.setMap (this.map);
  }

  onFileChange(ev) {
    this.clientes = [];
    this.transportes = [];

    this.cargando = true;

    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});

      console.log (jsonData);
      this.get_transportes (jsonData)
      this.set_items_clientes (jsonData);
      // this.get_clientes (jsonData);

      this.cargando = false;
    }

    reader.readAsBinaryString(file);
  }

  get_transportes (jsonData: any) {
    let colors: any [] = ['#3689e6', '#28bca3', '#f37329', '#a56de2', '#c6262e'];
    jsonData ['Tranportes (vt11)'].forEach ((element: any) => {
      this.transportes.push ({
        Placa: element.Placa,
        Transporte: element ['# Transporte'],
        items: [],
        clientes: [],
        optimizeWaypoints: true,
        visible: true
      });
    });

    this.transportes.forEach ((t: any, index: number) => {
      t.color = colors [index]
    })
  }

  set_items_clientes (jsonData: any) {
    jsonData ['Detalle (zbc021)'].forEach((element: any) => {
      if (this.transportes.find ((x => x.Transporte === element.TRANSPORTE)) !== undefined) {
        let transporte = this.transportes.find ((x =>  x.Transporte === element.TRANSPORTE));
        transporte.items.push ({
          id: element.Material,
          nombre: element.MATERIAL,
          cantidad: element.CANTIDAD,
          transporte: element.TRANSPORTE,
          um: element.UM,
          peso: element ['PESO BRUTO KG'],
          cliente_nombre: element.DESTINATARIO,
          cliente_direccion: element.DIRECCION,
          cliente_id: element ['COD.DESTINARIO'],
        })
      }

      if (this.clientes.find ((x => x.id === element ['COD.DESTINARIO'])) === undefined) {
        this.clientes.push ({
          id: element ['COD.DESTINARIO'],
          nombre: element ['DESTINATARIO'],
          direccion: element ['DIRECCION']
        });
      }
    });

    this.transportes.forEach ((transporte: any) => {
      transporte.items.forEach ((item: any) => {
        if (transporte.clientes.find (x => x.id === item.cliente_id) === undefined) {
          transporte.clientes.push ({
            id: item.cliente_id,
            nombre: item.cliente_nombre,
            direccion: item.cliente_direccion,
            latitud: 0,
            longitud: 0,
            orden: 0,
            distancia: 0,
            duracion: 0
          });
        }
      });
    });

    console.log (this.transportes);
  }

  eliminar_producto (item: any) {
    // for (let i = 0; i < this.items.length; i++) {
    //   if (this.items [i].id === item.id) {
    //     this.items.splice (i, 1);
    //   }
    // }
  }

  calcular_ubicacion_clientes () {
    this.cargando = true;

    var geocoder = new google.maps.Geocoder ();
    let c: number = 0;
    this.transportes.forEach ((transporte: any) => {
      transporte.clientes.forEach ((cliente: any, index: number) => {
        setTimeout(() => {
          c++
          let terminal_cliente = this.terminal_clientes.find (x => x.id === cliente.id.toString ());

          if (terminal_cliente !== undefined) {
            cliente.latitud = terminal_cliente.latitud;
            cliente.longitud = terminal_cliente.longitud;
          } else {
            geocoder.geocode({'address': cliente.direccion}, (results: any, status: any) => {
              if (status == google.maps.GeocoderStatus.OK) {
                cliente.latitud = results [0].geometry.location.lat ();
                cliente.longitud = results [0].geometry.location.lng ();
              }
            });
          }

          if (c >= this.clientes.length) {
            console.log ('termino', this.transportes);
            this.cargando = false;
            this.generar_ruta (false);
          }
        }, 1000 * (index + 1));
      });
    });
  }

  cambiar_orden (transporte: any, item: any, contador: number) {
    transporte.optimizeWaypoints = false;

    let tmp = transporte.clientes [item.orden + contador];
    transporte.clientes [item.orden + contador] = item;
    transporte.clientes [item.orden] = tmp;

    let orden = 0;
    transporte.clientes.forEach ((cliente: any) => {
      cliente.orden = orden;
      orden++;
    });
  }

  change_visible () {
    this.generar_ruta (true);
  }

  optimizar (transporte: any) {
    transporte.visible = true;
    this.generar_ruta (true);
  }

  generar_ruta (dibujar: boolean = false) {
    this.primera_carga = dibujar;
    let point_inicio = new google.maps.LatLng (-13.585056, -71.804972);

    let marker: any = new google.maps.Marker({
      position: point_inicio,
      animation: google.maps.Animation.DROP,
      label: {
        text: '0',
        color: "black",
        fontWeight: 'bold',
        fontSize: '16px'
      },
      map: this.map
    });

    var routes: any [] = [];
    this.transportes.forEach ((transporte: any, index: number) => {
      let waypoints: any [] = [];
      transporte.clientes.forEach ((cliente: any) => {
        waypoints.push ({
          location: new google.maps.LatLng (cliente.latitud, cliente.longitud),
          stopover: true
        });
      });

      let ruta = {
        visible: transporte.visible,
        color: transporte.color,
        origin: point_inicio,
        destination: point_inicio,
        waypoints: waypoints,
        optimizeWaypoints: transporte.optimizeWaypoints,
        travelMode: google.maps.TravelMode ['DRIVING']
      };

      routes.push (ruta);
    });

    for (var i = 0; i < this.directions_display.length; i++) {
      this.directions_display[i].setMap (null);
    }
    this.directions_display = [];

    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap (null);
    }
    this.markers = [];

    routes.forEach ((route: any, index: number) => {
      if (route.visible) {
        let color = route.color;
        var directionsDisplay = new google.maps.DirectionsRenderer ({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: route.color,
            strokeOpacity: 0.7,
            strokeWeight: 5
          }
        });
        directionsDisplay.setMap (this.map);
        this.directions_display.push (directionsDisplay);

        delete route.color;
        delete route.visible;

        this.directionsService.route (route, (result: any, status: any) => {
          if (status == google.maps.DirectionsStatus.OK) {
            if (dibujar) {
              directionsDisplay.setDirections (result);

              let count: number = 0;
              result.routes [0].waypoint_order.forEach ((element: number) => {
                this.transportes [index].clientes [element].orden = count;

                let _position = new google.maps.LatLng (
                  this.transportes [index].clientes [element].latitud,
                  this.transportes [index].clientes [element].longitud
                );

                // Dibujamos los mark para cada punto
                let marker: any = new google.maps.Marker({
                  position: _position,
                  animation: google.maps.Animation.DROP,
                  label: {
                    text: (count + 1).toString (),
                    color: "black",
                    fontWeight: 'bold',
                    fontSize: '16px'
                  },
                  map: this.map
                });

                marker.info = new google.maps.InfoWindow ({
                  content: '<b>Cliente:</b> ' + this.transportes [index].clientes [element].nombre
                });

                google.maps.event.addListener (marker, 'mouseover', () => {
                  marker.info.open (this.map, marker);
                });

                marker.addListener ('mouseout', () => {
                  marker.info.close ();
                });

                this.markers.push (marker);
                count++;
              });

              this.transportes [index].clientes = this.transportes [index].clientes.sort ((a: any, b: any) => {
                if (a.orden > b.orden) {
                  return 1;
                } else if (b.orden > a.orden) {
                  return -1
                } else {
                  return 0;
                }
              });

              for (let i = 0; i < result.routes [0].legs.length - 1; i++) {
                this.transportes [index].clientes [i].distancia = result.routes [0].legs [i].distance.value;
                this.transportes [index].clientes [i].duracion = result.routes [0].legs [i].duration.value;
              }
            }
          }
        });
      }
    });
  }

  submit () {
    if (confirm ('¿Esta seguro que desea crear el picking?')) {
      this.cargando = true;
      let pickings: any [] = [];

      this.transportes.forEach ((transporte: any) => {
        let picking: any = {
          id: this.database.createId (),
          alias: transporte.alias,
          almacen_valido: true,
          cliente_actual: {
            id: transporte.clientes [0].id.toString (),
            nombre: transporte.clientes [0].nombre,
            orden: 0
          },
          conductor_id: transporte.conductor.id,
          conductor_nombre: transporte.conductor.nombre_completo,
          vehiculo_id: transporte.vehiculo.id,
          vehiculo_alias: transporte.vehiculo.alias,
          estado: 'asignado',
          estado_pasado: null,
          evento_actual: null,
          fecha: moment ().format ("DD[-]MM[-]YYYY"),
          hora: moment ().format ("HH[:]MM"),
          hora_fin_carga: null,
          hora_fin_ruta: null,
          hora_inicio_carga: null,
          hora_inicio_ruta: null,
          hora_llegada_almacen: null,
          numero_total_rechazos_parciales: 0,
          numero_total_rechazos_totales: 0,
          ultimo_cliente_hora: null,
          tipo: 'Picking',
          clientes: [],
          productos: []
        }

        picking.clientes = transporte.clientes;
        picking.clientes.forEach ((cliente: any) => {
          cliente.id = cliente.id.toString ();
        });

        picking.productos = transporte.items;
        picking.productos.forEach ((item: any) => {
          item.id = item.id.toString ();
          item.estado = '';
        });

        picking.clientes.forEach ((cliente: any) => {
          cliente.productos = transporte.items.filter ((producto: any) => {
            return cliente.id === producto.cliente_id.toString ();
          });

          cliente.cliente_direccion = cliente.direccion;
          cliente.cliente_nombre = cliente.nombre;
          cliente.estado = 'asignado';
          cliente.hora_ausencia = null;
          cliente.hora_rechazo_total = null;
          cliente.hora_fin_descarga = null;
          cliente.hora_inicio_descarga = null;
          cliente.hora_llegada = null;
          cliente.orden = cliente.orden;
          cliente.tipo_descarga = '';
        });

        pickings.push (picking)
      });

      console.log (pickings);
      this.database.add_pickings (pickings)
        .then (() => {
          this.router.navigateByUrl ('pages/cardex/dashboard');
          this.cargando = false;
        })
        .catch ((error: any) => {
          console.log (error);
          this.cargando = false;
        });
    }
  }
}

