import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'ngx-agregar-usuario',
  templateUrl: './agregar-usuario.component.html',
  styleUrls: ['./agregar-usuario.component.scss']
})
export class AgregarUsuarioComponent implements OnInit {
  form: FormGroup;
  constructor(private database: DatabaseService) { }

  ngOnInit() {
    this.form = new FormGroup ({
      tipo: new FormControl ("1", [Validators.required]),
      nombre_completo: new FormControl ('', [Validators.required]),
      dni: new FormControl ('', [Validators.required]),
      direccion: new FormControl ('', [Validators.required]),
      celular: new FormControl ('', [Validators.required]),
      email: new FormControl ('', [Validators.required, Validators.email]),
      password: new FormControl ('', [Validators.required]),
      observaciones: new FormControl ('')
    });
  }

  submit () {
    let data = this.form.value;
    data.tipo = parseInt (data.tipo);

    this.database.add_usuario (data)
      .then (() => {
        this.form.reset ();
      })
      .catch ((error: any) => {
        console.log ('add_usuario', error);
      });
  }
}
