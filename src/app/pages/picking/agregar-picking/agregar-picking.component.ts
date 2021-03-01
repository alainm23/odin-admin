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

@Component({
  selector: 'ngx-agregar-picking',
  templateUrl: './agregar-picking.component.html',
  styleUrls: ['./agregar-picking.component.scss']
})
export class AgregarPickingComponent implements OnInit {
  @ViewChild('map', { static: false }) mapRef: ElementRef;
  map: any;

  directionsService: any;
  directionsDisplay: any;
  optimizeWaypoints: boolean = true;
  polylineOptions: any;
  colors: any;
  polylines: any
  infowindow: any;
  carga_ruta: boolean = false;

  vehiculo_seleccionado: any = null;
  conductor_seleccionado: any =  null;

  algolia_index: any;
  search_term: string = "";

  vehiculos: any [] = [];
  choferes: any [] = [];
  clientes: any [] = [];

  cliente_seleccionado: any;
  productos_para_seleccionar: any [] = [];
  
  cargando_productos: boolean = false;
  cargando_vehiculos: boolean = true;
  cargando_choferes: boolean = true;
  cargando: boolean = false;

  items: any [] = [];
  resultados: any [] = [];
  clientes_picking: any [] = [];

  form: FormGroup;
  constructor (
    private database: DatabaseService,
    private dialogService: NbDialogService,
    private router: Router
  ) { }

  ngOnInit () {
    const client = algoliasearch (environment.algolia.appId, environment.algolia.apiKey);
    this.algolia_index = client.initIndex (environment.algolia.indexName);

    this.form = new FormGroup ({
      id: new FormControl (''),
      vehiculo_id: new FormControl ('', [Validators.required]),
      vehiculo_alias: new FormControl ('', [Validators.required]),
      conductor_nombre: new FormControl ('', [Validators.required]),
      conductor_id: new FormControl ('', [Validators.required])
    });

    this.database.get_vehiculos ().subscribe ((res: any) => {
      this.vehiculos = res;
      this.cargando_vehiculos =  false;
    });

    this.database.get_usuarios_by_tipo (3).subscribe ((res: any) => {
      this.choferes = res;
      this.cargando_choferes = false;
    });

    this.database.get_terminal_clientes ().subscribe ((res: any) => {
      this.clientes = res;
    });
  }

  compareWith (item_01: any, item_02: any) {
    if (item_01 == null || item_02 == null) {
      return false;
    }

    return item_01.id === item_02.id;
  }

  vehiculoChanged (vehiculo_id: string) {
    this.vehiculos.forEach ((vehiculo: any) => {
      if (vehiculo.id === vehiculo_id) {
        this.vehiculo_seleccionado = vehiculo;

        let conductor = this.choferes.find (x => x.id === vehiculo.conductor.id);
        console.log (conductor);

        this.form.controls ['conductor_id'].setValue (conductor.id);
        this.form.controls ['conductor_nombre'].setValue (conductor.nombre_completo);
        this.form.controls ['vehiculo_alias'].setValue (vehiculo.alias);
      } 
    });
  }

  conductorChanged (conductor_id: string) {
    this.choferes.forEach ((conductor: any) => {
      if (conductor.id ===  conductor_id) {
        this.conductor_seleccionado = conductor;
        this.form.controls ['conductor_nombre'].setValue (conductor.nombre_completo);
      }
    });
  }
  
  search_changed () {
    if (this.search_term != "") {
      this.algolia_index.search (this.search_term).then((data: any)=>{
        this.resultados = [];
        if (data.hits.length > 0) {
          this.resultados = data.hits;
        }
      });
    } else {

    }
  }

  add_item (item: any) {
    this.items.push ({
      id: item.objectID,
      nombre: item.nombre,
      presentacion: item.presentacion,
      cantidad: 0,
      precio: 0,
      peso: 0,
      cliente: ''
    });

    this.search_term = "";
    this.resultados = [];
  }

  existe (item: any) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].objectID === item.objectID) {
        return true;
      }
    }

    return false;
  }

  agregar_producto (dialog: any) {
    this.dialogService.open (dialog);
  }

  actualizar_cliente_productos () {
    this.cargando_productos = true;
    if (this.cliente_seleccionado != null) {
      this.database.get_productos_precio_terminal_cliente (this.cliente_seleccionado.id).subscribe ((res: any []) => {
        this.productos_para_seleccionar = res;
        console.log (res);
        this.cargando_productos = false;
      });
    }
  }

  registrar (items: any [], ref: any) {
    items.forEach ((i: any) => {
      if (i.cantidad !== ''  && i.cantidad !== 0 && i.cantidad !== undefined && i.cantidad !== null) {
        this.items.push ({
          id: this.database.createId (),
          producto_id: i.data.id,
          nombre: i.ref.nombre,
          presentacion: i.ref.presentacion,
          cantidad: i.cantidad,
          precio: i.data.precio,
          precio_base: i.ref.precio_base,
          cliente_id: this.cliente_seleccionado.id,
          cliente_nombre: this.cliente_seleccionado.nombre_cliente
        })
      }
    });
    ref.close ();
  }

  eliminar_producto (item: any) {
    for (let i = 0; i < this.items.length; i++) { 
      if (this.items [i].id === item.id) {
        this.items.splice (i, 1); 
      }
    }
  }

  obtener_clientes () {
    this.items.forEach ((producto: any) => {
      if (this.cliente_existe (producto.cliente_id) === undefined) {
        console.log (this.clientes.find (x => x.id === producto.cliente_id));
        this.clientes_picking.push ({
          id: producto.cliente_id,
          cliente: this.clientes.find (x => x.id === producto.cliente_id)
        });
      }
    });

    this.crear_ruta ();
  }

  cliente_existe (id: string) {
    return this.clientes_picking.find (x => x.id === id);
  }

  crear_ruta () {
    this.carga_ruta = true;

    let point_inicio = new google.maps.LatLng (-13.528726, -71.940001);
    let infowindow = new google.maps.InfoWindow ();

    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer({
      suppressPolylines: true,
      suppressMarkers: true,
      infoWindow: infowindow
    });

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
    this.directionsDisplay.setMap (this.map);

    let waypoints: any [] = [];
    this.clientes_picking.forEach ((cliente: any) => {
      waypoints.push ({
        location: new google.maps.LatLng (cliente.cliente.latitud, cliente.cliente.longitud),
        stopover: true
      });
    });

    let request = {
      origin: point_inicio,
      destination: point_inicio,
      waypoints: waypoints,
      optimizeWaypoints: this.optimizeWaypoints,
      provideRouteAlternatives: true,
      travelMode: google.maps.TravelMode ['DRIVING']
    }

    this.directionsService.route (request, (response: any, status: any) => {
      if (status == 'OK') {
        this.carga_ruta = false;
        this.directionsDisplay.setOptions({
          directions: response,
        });

        console.log ('Respuesta', response);

        let polylineOptions = {
          strokeColor: '#C83939',
          strokeOpacity: 1,
          strokeWeight: 4
        };
        let colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];
        let polylines = [];

        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < polylines.length; i++) {
          polylines[i].setMap(null);
        }
        var legs = response.routes[0].legs;
        for (let i = 0; i < legs.length; i++) {
          var steps = legs[i].steps;
          for (let j = 0; j < steps.length; j++) {
            var nextSegment = steps[j].path;
            var stepPolyline = new google.maps.Polyline(polylineOptions);
            stepPolyline.setOptions({
              strokeColor: colors[i]
            })
            for (let k = 0; k < nextSegment.length; k++) {
              stepPolyline.getPath().push(nextSegment[k]);
              bounds.extend(nextSegment[k]);
            }
            polylines.push(stepPolyline);
            stepPolyline.setMap(this.map);
            // route click listeners, different one on each step
            google.maps.event.addListener(stepPolyline, 'click', (evt: any) => {
              infowindow.setContent("you clicked on the route<br>" + evt.latLng.toUrlValue(6));
              infowindow.setPosition(evt.latLng);
              infowindow.open(this.map);
            });
          }
        }

        this.map.fitBounds(bounds);

        let marker = new google.maps.Marker({
          position: point_inicio,
          icon: 'assets/img/icono almacen.png',
          map: this.map
        });

        let count: number = 0;
        response.routes [0].waypoint_order.forEach((element: number) => {
          // Asignamos el orden que nos da Google Maps
          this.clientes_picking [element].orden = count;

          // Dibujamos los mark para cada punto
          let marker = new google.maps.Marker({
            position: waypoints [element].location,
            label: { 
              text: (count + 1).toString (),
              color: "white",
              fontWeight: 'bold',
              fontSize: '16px'
            },
            map: this.map
          });
          
          count++;
        });
        
        this.clientes_picking = this.clientes_picking.sort ((a: any, b: any) => {
          if (a.orden > b.orden) {
            return 1;
          } else if (b.orden > a.orden) {
            return -1
          } else {
            return 0;
          }
        });

        console.log ('Orden de ruta:', this.clientes_picking);
      }
    });
  }

  cambiar_orden (item: any, contador: number) {
    this.optimizeWaypoints = false;

    let tmp = this.clientes_picking [item.orden + contador];
    this.clientes_picking [item.orden + contador] = item;
    this.clientes_picking [item.orden] = tmp;
    
    let orden = 0;
    this.clientes_picking.forEach ((cliente: any) => {
      cliente.orden = orden;
      orden++;
    });

    this.crear_ruta ();
  }

  submit () {
    if (confirm ('Crear?')) {
      this.cargando = true;

      let cardex: any = {
        id: this.database.createId (),
        almacen_valido: false,
        cliente_actual: {
          id: this.clientes_picking [0].id,
          nombre: this.clientes_picking [0].cliente.nombre_cliente,
          orden: 0
        },
        conductor_id: this.form.value.conductor_id,
        conductor_nombre: this.form.value.conductor_nombre,
        vehiculo_id: this.form.value.vehiculo_id,
        vehiculo_alias: this.form.value.vehiculo_alias,
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
        ultimo_cliente_hora: null
      }

      let informacion_clientes: any [] = [];
      let clientes: any [] = [];
      this.clientes_picking.forEach ((cliente: any) => {
        clientes.push ({
          id: cliente.id,
          orden: cliente.orden,
          cliente_direccion: cliente.cliente.direccion,
          cliente_nombre: cliente.cliente.nombre_cliente,
          latitud: cliente.cliente.latitud,
          longitud: cliente.cliente.longitud,
        });
        informacion_clientes.push ({
          id: cliente.id,
          cliente_direccion: cliente.cliente.direccion,
          cliente_nombre: cliente.cliente.nombre_cliente,
          estado: 'asignado',
          hora_ausencia: null,
          hora_rechazo_total: null,
          hora_fin_descarga: null,
          hora_inicio_descarga: null,
          hora_llegada: null,
          latitud: cliente.cliente.latitud,
          longitud: cliente.cliente.longitud,
          orden: cliente.orden,
          tipo_descarga: '',
          Productos: this.get_productos_por_cliente (cliente.id)
        });
      });
      cardex.clientes = clientes;

      let Productos: any [] = [];
      this.items.forEach ((producto: any) => {
        if (Productos.find (x => x.id === producto.producto_id) === undefined) {
          Productos.push ({
            id: producto.producto_id,
            nombre: producto.nombre,
            cantidad: parseInt (producto.cantidad)
          });
        } else {
          let tmp_producto = Productos.find (x => x.id === producto.producto_id);
          tmp_producto.cantidad += parseInt (producto.cantidad);
        }
      });

      console.log (informacion_clientes);

      this.database.add_picking (cardex, informacion_clientes, Productos)
        .then (() => {
          this.router.navigateByUrl ('pages/cardex/dashboard');
          this.cargando = false;
        })
        .catch ((error: any) => {
          this.cargando = false;
        })
     }
  }

  get_productos_por_cliente (cliente_id: string) {
    let productos: any [] = [];
    this.items.forEach ((producto: any) => {
      if (productos.find (x => x.cliente_id === producto.cliente_id) === undefined) {
        if (productos.find (x => x.id === producto.producto_id) === undefined) {
          productos.push ({
            id: producto.producto_id,
            checked: false,
            estado: '',
            nombre: producto.nombre,
            cantidad: parseInt (producto.cantidad),
            rechazo_cantidad: 0,
            rechazo_motivo: ''
          });
        } else {
          let tmp_producto = productos.find (x => x.id === producto.producto_id);
          tmp_producto.cantidad += parseInt (producto.cantidad);
        }
      }
    });

    return productos;
  }
}
