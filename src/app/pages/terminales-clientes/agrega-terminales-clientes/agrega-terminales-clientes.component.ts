import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';
import * as moment from 'moment';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-agrega-terminales-clientes',
  templateUrl: './agrega-terminales-clientes.component.html',
  styleUrls: ['./agrega-terminales-clientes.component.scss']
})
export class AgregaTerminalesClientesComponent implements OnInit {
  form: FormGroup;
  constructor (
    private database: DatabaseService) { }

  ngOnInit() {
    this.form = new FormGroup ({
      direccion: new FormControl ('', [Validators.required]),
      referencia: new FormControl ('', [Validators.required]),
      latitud: new FormControl ('', [Validators.required]),
      longitud: new FormControl ('', [Validators.required]),
      nombre_cliente: new FormControl ('', [Validators.required]),
      tipo: new FormControl ('administrador', [Validators.required]),
      ruc: new FormControl ('', [Validators.required]),
      telefono: new FormControl ('', [Validators.required]),
      correo: new FormControl ('', [Validators.required]),
      persona_contacto: new FormControl ('', [Validators.required])
    });
  }

  submit () {
    let request = this.form.value;
    request.fecha_registro = new Date ().toISOString ();
    request.hora_registro = moment().format('hh[:]mm[:]ss');
    request.mes = moment ().format ('MM');
    request.anio = moment ().format ('YYYY');

    console.log (request);

    this.database.add_terminal_cliente (this.form.value)
      .then (() => {
        this.form.reset ();
      })
      .catch ((error: any) => {
        console.log ('add_chofer', error);
      });
  }
}
