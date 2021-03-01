import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';
import { NbDialogService } from '@nebular/theme';
import { Router } from '@angular/router';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'ngx-listar-vehiculos',
  templateUrl: './listar-vehiculos.component.html',
  styleUrls: ['./listar-vehiculos.component.scss']
})
export class ListarVehiculosComponent implements OnInit {
  items: any [] = [];
  choferes: any [] = [];
  recargas_gas: any [] = [];
  form: FormGroup;
  loading: boolean = false;
  constructor(private database: DatabaseService,
              private dialogService: NbDialogService,
              private router: Router) { }

  ngOnInit() {
    this.form = new FormGroup ({
      id: new FormControl (''),
      alias: new FormControl ('', [Validators.required]),
      nro_placa: new FormControl ('', [Validators.required]),
      marca: new FormControl ('', [Validators.required]),
      modelo: new FormControl ('', [Validators.required]),
      conductor: new FormControl ('', [Validators.required]),
      peso_carga_bruta: new FormControl ('', [Validators.required]),
      volumen_carga_bruta: new FormControl ('', [Validators.required]),
      observaciones: new FormControl (''),
      estado: new FormControl ()
    });

    this.database.get_vehiculos ().subscribe ((res: any []) => {
      this.items = res;
    });

    this.database.get_usuarios_by_tipo (3).subscribe ((res: any) => {
      this.choferes = res;
    });
  }

  delete (item: any) {
    if (confirm("¿Esta seguro que desea continuar?") == true) {
      this.loading = true;
      this.database.delete_vehiculo (item).then (() => {
        this.loading = false;
      }, error => {
        this.loading = false;
      });
    }
  }

  registrar_modal (dialog: any) {
    this.dialogService.open (dialog);
  }

  editar (item: any, dialog: any) {
    item.disabled = true;
    this.dialogService.open(dialog, { context: 'this is some additional data passed to dialog' });
    this.form.patchValue (item);
  }

  cancelar (dialog: any) {
    dialog.close ();
    this.form.reset ();
  }

  submit (ref: any) {
    this.loading = true;

    this.database.add_vehiculo (this.form.value)
      .then (() => {
        ref.close ();
        this.form.reset ();
        this.loading = false;
      })
      .catch ((error: any) => {
        ref.close ();
        console.log ('add_chofer', error);
        this.form.reset ();
        this.loading = false;
      });
  }

  compareWith (item_01: any, item_02: any) {
    if (item_01 == null || item_02 == null) {
      return false;
    }

    return item_01.id === item_02.id;
  }

  edit (item: any) {
    if (item.editar === null || item.editar === undefined) {
      item.editar = true
    } else {
      item.editar = !item.editar;
    }
  }

  cancel (item: any) {
    item.editar = false;
  }

  save (item: any) {
    this.loading = true;

    item.alias = (<HTMLInputElement>document.getElementById (item.id + '_alias')).value;
    item.nro_placa = (<HTMLInputElement>document.getElementById (item.id + '_nro_placa')).value;
    item.marca = (<HTMLInputElement>document.getElementById (item.id + '_marca')).value;
    item.modelo = (<HTMLInputElement>document.getElementById (item.id + '_modelo')).value;
    item.peso_carga_bruta = (<HTMLInputElement>document.getElementById (item.id + '_peso_carga_bruta')).value;
    item.volumen_carga_bruta = (<HTMLInputElement>document.getElementById (item.id + '_volumen_carga_bruta')).value;
    // item.conductor = (<HTMLInputElement>document.getElementById (item.id + '_conductor')).value;

    console.log (item);

    this.database.update_vehiculo (item).then (() => {
      item.editar = false;
      this.loading = false;
    }).catch ((error: any) => {
      console.log (error);
      this.loading = false;
      item.editar = false;
    });
  }

  check_value (event: any, item: any) {
    var alias = (<HTMLInputElement>document.getElementById (item.id + '_alias')).value;
    var nro_placa = (<HTMLInputElement>document.getElementById (item.id + '_nro_placa')).value;
    var marca = (<HTMLInputElement>document.getElementById (item.id + '_marca')).value;
    var modelo = (<HTMLInputElement>document.getElementById (item.id + '_modelo')).value;
    var peso_carga_bruta = (<HTMLInputElement>document.getElementById (item.id + '_peso_carga_bruta')).value;
    var volumen_carga_bruta = (<HTMLInputElement>document.getElementById (item.id + '_volumen_carga_bruta')).value;

    if (alias == '' || nro_placa == '' || marca == '' || modelo == '' || peso_carga_bruta == '' || volumen_carga_bruta == '') {
      item.disabled = true;
    } else {
      item.disabled = false;
    }
  }

  go_page (page: string) {
    this.router.navigateByUrl (page);
  }

  ver_carga_combustible (item: any, dialog: any) {
    this.dialogService.open (dialog, {context: item});
    console.log (item);
    this.loading = true;

    this.database.get_vehiculo_recargas_gas (item.id).subscribe ((res: any []) => {
      console.log (res);
      this.recargas_gas = res;
      this.loading = false;
    });
  }

  get_date_format (date: string) {
    return moment (date).format ('lll');
  }
}
