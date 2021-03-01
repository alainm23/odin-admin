import { Component, OnInit } from '@angular/core';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { DatabaseService } from '../../../services/database.service';
import * as CanvasJS from 'assets/canvasjs.min.js';
import { NbDialogService } from '@nebular/theme';

@Component({
  selector: 'ngx-administrar-marcas',
  templateUrl: './administrar-marcas.component.html',
  styleUrls: ['./administrar-marcas.component.scss']
})
export class AdministrarMarcasComponent implements OnInit {
  form: FormGroup;
  items: any [] = [];

  anio_seleccionado: string = '';
  mes_seleccionado: string = '';
  constructor (
    private database: DatabaseService,
    private dialogService: NbDialogService
  ) { }

  ngOnInit() {
    this.form = new FormGroup ({
      nombre: new FormControl ('', [Validators.required])
    });

    this.database.get_marcas ().subscribe ((res: any []) => {
      this.items = res;
      console.log (res);
    });
  }

  abrir_nuevo (dialog: any) {
    this.dialogService.open (dialog);
  }

  cancelar_nuevo (ref: any) {
    ref.close ();
    this.form.reset ();
  }

  agregar_marca (ref: any) {
    this.database.add_marca (this.form.value.nombre)
      .then (() => {
        ref.close ();
        this.form.reset ();
      })
      .catch ((error: any) => {
        ref.close ();
        this.form.reset ();
      });
  }

  ver_estadisticas (item: any, dialog: any) {
    this.dialogService.open (dialog);
    var current_year = new Date ().getFullYear ();

    let chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
      exportEnabled: true,
      title: {
        text: item.nombre + ': ' + (current_year - 1).toString () + ' - ' + current_year.toString ()
      },
      axisY: {
        titleFontColor: "#4F81BC",
        lineColor: "#4F81BC",
        labelFontColor: "#4F81BC",
        tickColor: "#4F81BC"
      },
      axisY2: {
        titleFontColor: "#C0504E",
        lineColor: "#C0504E",
        labelFontColor: "#C0504E",
        tickColor: "#C0504E"
      },
      data: [{
        type: "column",
        name: (current_year - 1).toString (),
        showInLegend: true,
        toolTipContent: "<b>Mes:</b>{label}<br><b>Cantidad:</b>{cantidad}<br><b>Monto:</b>{y}",
        dataPoints: [
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year - 1).toString (), '01'),
            label: "Enero",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year - 1).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year - 1).toString (), '02'),
            label: "Febrero",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year - 1).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year - 1).toString (), '03'),
            label: "Marzo",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year - 1).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year - 1).toString (), '04'),
            label: "Abril",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year - 1).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year - 1).toString (), '05'),
            label: "Mayo",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year - 1).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year - 1).toString (), '06'),
            label: "Junio",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year - 1).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year - 1).toString (), '07'),
            label: "Julio",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year - 1).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year - 1).toString (), '08'),
            label: "Agosto",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year - 1).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year - 1).toString (), '09'),
            label: "Septiembre",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year - 1).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year - 1).toString (), '10'),
            label: "Octubre",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year - 1).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year - 1).toString (), '11'),
            label: "Noviembre",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year - 1).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year - 1).toString (), '12'),
            label: "Diciembre",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year - 1).toString (), '01')
          }
        ]
      }, {
        type: "column",
        name: (current_year).toString (),
        showInLegend: true,
        toolTipContent: "<b>Mes:</b>{label}<br><b>Cantidad:</b>{cantidad}<br><b>Monto:</b>{y}",
        dataPoints: [
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year).toString (), '01'),
            label: "Enero",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year).toString (), '02'),
            label: "Febrero",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year).toString (), '03'),
            label: "Marzo",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year).toString (), '04'),
            label: "Abril",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year).toString (), '05'),
            label: "Mayo",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year).toString (), '06'),
            label: "Junio",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year).toString (), '07'),
            label: "Julio",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year).toString (), '08'),
            label: "Agosto",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year).toString (), '09'),
            label: "Septiembre",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year).toString (), '10'),
            label: "Octubre",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year).toString (), '11'),
            label: "Noviembre",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year).toString (), '01')
          },
          {
            y: this.get_data_estadisticas (item, 'monto', (current_year).toString (), '12'),
            label: "Diciembre",
            cantidad: this.get_data_estadisticas (item, 'cantidad', (current_year).toString (), '01')
          }
        ]
      }]
    });

    chart.render();
  }

  get_data_estadisticas (item: any, doc: string, year: string, month: string) {
    if (item ['resumen_' + year] === null || item ['resumen_' + year] === undefined) {
      return 0;
    }

    if (item ['resumen_' + year] [doc + '_' + month] === null || item ['resumen_' + year] [doc + '_' + month] === undefined) {
      return 0;
    }

    return item ['resumen_' + year] [doc + '_' + month];
  }

  eliminar (item: any) {
    console.log (item);
    if (item.cantidad_productos > 0) {
      alert ("Esta categoria tiene " +  item.cantidad_productos + " producto (s) disponible (s). No se puede eliminar");
    } else {
      var opcion = confirm("Eliminar?");
      if (opcion == true) {
        this.database.remove_categoria (item);
      } else {
        console.log ("Cancelar");
      }
    }
  }

  edit (item: any) {
    if (item.editar === null || item.editar === undefined) {
      item.editar = true
    } else {
      item.editar = !item.editar;
    }
  }

  check_value (event: any, item: any) {
    var nombre = (<HTMLInputElement>document.getElementById (item.id + '_nombre')).value;

    if (nombre === '') {
      item.disabled = true;
    } else {
      item.disabled = false;
    }
  }

  save (item: any) {
    console.log (item);

    let request: any = {
      id: item.id,
      nombre: (<HTMLInputElement>document.getElementById (item.id + '_nombre')).value,
      cantidad_productos: item.cantidad_productos,
      fecha_creada: item.fecha_creada,
      fecha_actualizada: new Date ().toISOString ()
    };

    console.log (request);

    this.database.update_marca (request)
      .then (() => {
        item.editar = false;
      }).catch (() => {
        item.editar = false;
      });
  }

  open_reportes (dialog: any) {
    this.dialogService.open (dialog);
  }

  cancel_edicion (item: any) {
    item.editar = false;
  }

  get_total (item: any, tipo: string) {
    if (this.anio_seleccionado === '' && this.mes_seleccionado === '') {
      return this.check_reportes_value (item ['total_' + tipo]);
    }

    if (this.anio_seleccionado !== '' && this.mes_seleccionado === '') {
      return this.check_reportes_value (item ['resumen_' + this.anio_seleccionado] ['total_' + tipo]);
    }

    if (this.anio_seleccionado !== '' && this.mes_seleccionado !== '') {
      return this.check_reportes_value (item ['resumen_' + this.anio_seleccionado] [tipo + '_' + this.mes_seleccionado]);
    }
  }

  check_reportes_value (item: any) {
    if (item === null || item === undefined) {
      return 0;
    }

    return item;
  }
}
