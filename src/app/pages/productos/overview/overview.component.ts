import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { NbDialogService } from '@nebular/theme';
import { finalize } from 'rxjs/operators';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  categorias: any [] = [];
  marcas: any [] = [];

  items: any [] = [];
  presentaciones: any [] = [];
  productos: any [] = [];
  form: FormGroup;
  form_producto_movimiento: FormGroup;
  nueva_presentacion_form: FormGroup;
  item_seleccionado: any = null;

  imagen_preview: any = null;
  file: any;
  uploadPercent: number = 0;
  is_upload: boolean = false;

  producto_seleccionado: any = null;
  view: number = 0;

  pagination_number: number = 0;
  desabilitar_proximo: boolean = false;

  throttle = 300;
  scrollDistance = 1;
  scrollUpDistance = 2;

  nuevo_item: boolean = false;
  nuevo_cargando: boolean = false;

  anio_seleccionado: string = '';
  mes_seleccionado: string = '';
  constructor (
    private database: DatabaseService,
    private af_storage: AngularFireStorage,
    private dialogService: NbDialogService) { }

  ngOnInit() {
    this.form = new FormGroup ({
      nombre: new FormControl ('', [Validators.required]),
      imagen_url: new FormControl (''),
      presentacion: new FormControl ('', [Validators.required]),
      categoria: new FormControl ('', [Validators.required]),
      marca: new FormControl ('', [Validators.required]),
      precio_base: new FormControl ('', [Validators.required])
    });

    this.form_producto_movimiento = new FormGroup ({
      id: new FormControl (this.database.createId ()),
      fecha: new FormControl (''),
      hora: new FormControl (''),
      mes: new FormControl (''),
      anio: new FormControl (''),
      tipo_comprobante: new FormControl (''),
      nro_comprobante: new FormControl (''),
      cliente: new FormControl ('', [Validators.required]),
      cantidad: new FormControl ('', [Validators.required]),
      precio: new FormControl ('', [Validators.required])
    });

    this.database.getCategorias ().subscribe ((res: any []) => {
      this.categorias = res;
    });

    this.database.get_productos_first ().subscribe ((res: any []) => {
      this.items = res;
    });

    this.database.get_marcas ().subscribe ((res: any []) => {
      this.marcas = res;
    });

    this.database.get_productos_nodo ().subscribe ((res: any []) => {
      this.productos = res;
    });
  }

  nuevo () {
    this.nuevo_item = !this.nuevo_item;
    console.log (this.nuevo_item);
  }

  cancel_nuevo () {
    this.nuevo_item = false;
    this.item_seleccionado = null;
    this.form.reset ();
  }

  async save_nuevo_item () {
    this.nuevo_cargando = true;

    let data: any = {
      id: await this.database.generate_producto_id (),
      nombre: this.form.value.nombre,
      imagen_url: this.form.value.imagen_url,
      presentacion: this.form.value.presentacion,
      categoria_nombre: this.form.value.categoria.nombre,
      categoria_id: this.form.value.categoria.id,
      marca_id: this.form.value.marca.id,
      marca_nombre: this.form.value.marca.nombre,
      precio_base: this.form.value.precio_base,
      stock: 0
    };
    
    data.id = data.id.toString ();

    if (this.item_seleccionado !== null) {
      data.producto_id = this.item_seleccionado.producto_id;
      data.producto_nombre = this.item_seleccionado.producto_nombre;

      this.database.add_producto_clasificacion (data)
        .then (() => {
          this.nuevo_cargando = false;
          this.form.reset ();
          this.nuevo_item = false;
          this.item_seleccionado = null;
        })
        .catch ((error: any) => {
          console.log ('add_producto', error);
          this.nuevo_cargando = false;
          this.form.reset ();
          this.nuevo_item = false;
          this.item_seleccionado = null;
        });
    } else {
      this.database.add_producto (data)
        .then (() => {
          this.nuevo_cargando = false;
          this.form.reset ();
          this.nuevo_item = false;
        })
        .catch ((error: any) => {
          console.log ('add_producto', error);
          this.nuevo_cargando = false;
          this.form.reset ();
          this.nuevo_item = false;
        });
    }
  }

  compareWith (item_01: any, item_02: any) {
    if (item_01 == null || item_02 == null) {
      return false;
    }

    return item_01.id === item_02.id;
  }

  open_registrar (dialog: any) {
    this.dialogService.open (dialog);
  }

  open_registrar_presentacion (dialog: any) {
    this.dialogService.open (dialog);
  }

  changeListener (event: any) {
    this.file = event.target.files [0];
    this.getBase64 (this.file);
  }

  getBase64(file: any) {
    var reader = new FileReader ();
    reader.readAsDataURL(file);

    reader.onload = () => {
      this.imagen_preview = reader.result;
    };

    reader.onerror = (error) => {

    };
  }

  submit (dialog: any) {
    this.is_upload = true;

    let request = this.form.value;
    const filePath = '/Productos/' + request.id;
    const fileRef = this.af_storage.ref (filePath);
    const task = this.af_storage.upload (filePath, this.file);

    task.percentageChanges ().subscribe ((res: any) => {
      this.uploadPercent = res;
    });

    task.snapshotChanges ().pipe (
      finalize (async () => {
        let downloadURL = await fileRef.getDownloadURL ().toPromise();
        request.imagen_url = downloadURL;

        this.database.add_producto (request)
          .then (() => {
            this.is_upload = false;
            this.form.reset ();
            dialog.close ();
          })
          .catch ((error: any) => {
            console.log ('add_producto', error);
            this.is_upload = false;
          });

        dialog.close ();
      })
    )
    .subscribe ();
  }

  ver_presentaciones (item: any) {
    this.producto_seleccionado = item;
    this.view = 1;

    this.database.get_presentaciones (item.id).subscribe ((res: any []) => {
      this.presentaciones = res;
    });
  }

  navegar (view: number) {
    this.view = view;
  }

  submit_presentacion (dialog: any) {
    this.is_upload = true;

    if (this.producto_seleccionado !== null) {
      this.database.add_presentacion (this.nueva_presentacion_form.value, this.producto_seleccionado.id)
        .then (() => {
          this.is_upload = false;
          this.nueva_presentacion_form.reset ();
          dialog.close ();
        })
        .catch ((error: any) => {
          console.log ('add_presentacion error', error);
          this.is_upload = false;
          dialog.close ();
        });
    }
  }

  eliminar (item: any) {
    console.log (item);

    if (confirm("Press a button!") == true) {
      this.database.delete_producto_clasificacion (item);
    }
  }

  agregar_movimiento (item: any, dialog: any) {
    this.dialogService.open (dialog);
  }

  genera () {
    let c = 0;
    while (c < 60) {
      let data: any = {
        id: this.database.createId (),
        nombre: c,
        timestamp: new Date().getTime ()
      }

      this.database.add_producto (data);
      c++;
    }
  }

  nextPage () {
    this.pagination_number += 10;
    this.database.get_productos_next (this.pagination_number).subscribe ((res: any []) => {
      console.log (res);
      this.items = this.items.concat (res);
    });
  }

  prevPage () {
    this.pagination_number -= 10;
    if (this.pagination_number < 0) {
      this.pagination_number = 0;
    }

    this.database.get_productos_prev (this.pagination_number).subscribe ((res: any []) => {
      console.log (res);
      this.items = res;

      if (res.length >= 10) {
        this.desabilitar_proximo = false;
      }
    });
  }

  onScrollDown (ev) {
    this.nextPage ();
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
    console.log (item);

    let request: any = {
      id: item.id,
      nombre: (<HTMLInputElement>document.getElementById (item.id + '_nombre')).value,
      presentacion: (<HTMLInputElement>document.getElementById (item.id + '_presentacion')).value,
      categoria_id: (<HTMLInputElement>document.getElementById (item.id + '_categoria')).value,
      categoria_nombre: item.categoria_nombre,
      marca_id: (<HTMLInputElement>document.getElementById (item.id + '_marca')).value,
      marca_nombre: item.marca_nombre,
      precio_base: (<HTMLInputElement>document.getElementById (item.id + '_precio_base')).value
    };

    this.database.update_producto (request)
      .then (() => {
        item.editar = false;
      }).catch (() => {
        item.editar = false;
      });
  }

  check_value (event: any, item: any) {
    var nombre = (<HTMLInputElement>document.getElementById (item.id + '_nombre')).value;
    var presentacion = (<HTMLInputElement>document.getElementById (item.id + '_presentacion')).value;
    var categoria = (<HTMLInputElement>document.getElementById (item.id + '_categoria')).value;
    var marca = (<HTMLInputElement>document.getElementById (item.id + '_marca')).value;
    var precio_base = (<HTMLInputElement>document.getElementById (item.id + '_precio_base')).value;

    if (nombre === '' || presentacion === '' || categoria === '' || precio_base === '' || marca === '') {
      item.disabled = true;
    } else {
      item.disabled = false;
    }
  }

  agregar_clasificacion (item: any) {
    this.item_seleccionado = item;
    this.nuevo_item = true;
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
}
