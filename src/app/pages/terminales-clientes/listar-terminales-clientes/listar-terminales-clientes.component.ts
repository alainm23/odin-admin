import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';
import { NbDialogService } from '@nebular/theme';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

// Search Provider
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
const algoliasearch = require('algoliasearch');

@Component({
  selector: 'ngx-listar-terminales-clientes',
  templateUrl: './listar-terminales-clientes.component.html',
  styleUrls: ['./listar-terminales-clientes.component.scss']
})
export class ListarTerminalesClientesComponent implements OnInit {
  algolia_index: any;
  search_term: string = "";
  resultados: any [] = [];

  items: any [] = [];
  productos_precio: any [] = [];
  form: FormGroup;
  item_seleccionado: any;

  anio_seleccionado: string = '';
  mes_seleccionado: string = '';
  constructor(private database: DatabaseService,
              private dialogService: NbDialogService,
              private router: Router) { }

  ngOnInit() {
    const client = algoliasearch (environment.algolia.appId, environment.algolia.apiKey);
    this.algolia_index = client.initIndex (environment.algolia.indexName);

    this.form = new FormGroup ({
      id: new FormControl (''),
      direccion: new FormControl ('', [Validators.required]),
      referencias: new FormControl ('', [Validators.required]),
      latitud: new FormControl ('', [Validators.required]),
      longitud: new FormControl ('', [Validators.required]),
      denominacion: new FormControl ('', [Validators.required]),
      nombre_comercial: new FormControl ('', [Validators.required]),
      ruc: new FormControl ('', [Validators.required]),
      observaciones: new FormControl ('')
    });

    this.database.get_terminal_clientes ().subscribe ((res: any []) => {
      console.log (res);
      this.items = res;
    });
  }

  delete (item: any) {
    if (confirm("Press a button!") == true) {
      console.log ("Entro aqui", item);
      this.database.delete_terminal_cliente (item)
        .then (() => {
          console.log ('Eliminado', item);
        })
        .catch ((error: any) => {
          console.log ('delete_terminal_cliente', error);
        })
    }
  }

  editar (item: any, dialog: any) {
    this.dialogService.open(dialog, { context: 'this is some additional data passed to dialog' });
    this.form.patchValue (item);
  }

  cancelar (dialog: any) {
    dialog.close ();
    this.form.reset ();
  }

  submit (dialog: any) {
    this.database.update_terminal_cliente (this.form.value)
      .then (() => {
        dialog.close ();
        this.form.reset ();
      })
      .catch ((error: any) => {
        console.log ('update_chofer', error);
      });
  }

  open_reportes (dialog: any) {
    this.dialogService.open (dialog);
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

  ver_productos (item: any, dialog: any) {
    this.item_seleccionado = item;
    this.dialogService.open (dialog);

    this.database.get_productos_precio_terminal_cliente (item.id).subscribe ((res: any []) => {
      console.log (res);
      this.productos_precio = res;
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
    console.log (item);

    if (this.item_seleccionado !== null) {
      this.database.add_producto_terminal_cliente (this.item_seleccionado.id, item)
        .then (() => {

        }).catch (() => {

        });
    }

    this.search_term = "";
    this.resultados = [];
  }

  edit_precio (item: any) {
    item.editar = true;
    item.data._precio = item.data.precio;
  }

  cancel_precio (item: any) {
    item.editar = false;
    item.data.precio = item.data._precio;
  }

  eliminar_precio (item: any) {
    console.log (this.item_seleccionado);
    console.log (item);

    if (confirm("Press a button!") == true) {
      this.database.remove_producto_terminal_cliente (this.item_seleccionado.id, item.data.id);
    }
  }

  save_precio (item: any) {
    if (this.item_seleccionado != null) {
      this.database.update_producto_terminal_cliente (this.item_seleccionado.id, item.data)
        .then (() => {
          item.editar = false
        }).catch ((error: any) => {
          item.editar = false;
        });
    }
  }

  registrar () {
    this.router.navigateByUrl ('pages/terminales-clientes/agrega-terminales-clientes');
  }
}
