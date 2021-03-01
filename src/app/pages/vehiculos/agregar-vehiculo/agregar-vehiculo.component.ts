import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-agregar-vehiculo',
  templateUrl: './agregar-vehiculo.component.html',
  styleUrls: ['./agregar-vehiculo.component.scss']
})
export class AgregarVehiculoComponent implements OnInit {
  form: FormGroup;
  choferes: any [] = [];
  constructor(private database: DatabaseService) { }

  ngOnInit() {
    this.form = new FormGroup ({
      nro_placa: new FormControl ('', [Validators.required]),
      marca: new FormControl ('', [Validators.required]),
      alias: new FormControl ('', [Validators.required]),
      modelo: new FormControl ('', [Validators.required]),
      conductor: new FormControl ('', [Validators.required]),
      peso_carga_bruta: new FormControl ('', [Validators.required]),
      volumen_carga_bruta: new FormControl ('', [Validators.required]),
      observaciones: new FormControl (''),
      latitude: new FormControl (0),
      longitude: new FormControl (0),
      estado: new FormControl (2, [Validators.required])
    });

    this.database.get_usuarios_by_tipo (3).subscribe ((res: any) => {
      console.log (res);
      this.choferes = res;
    });
  }

  submit () {
    this.database.add_vehiculo (this.form.value)
      .then (() => {
        this.form.reset ();
      })
      .catch ((error: any) => {
        console.log ('add_chofer', error);
      });
  }

  compareWith (item_01: any, item_02: any) {
    if (item_01 == null || item_02 == null) {
      return false;
    }

    return item_01.id === item_02.id;
  }
}
