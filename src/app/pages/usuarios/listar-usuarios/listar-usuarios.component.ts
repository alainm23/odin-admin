import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';
import { NbDialogService } from '@nebular/theme';

// Forms
import { FormGroup , FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-listar-usuarios',
  templateUrl: './listar-usuarios.component.html',
  styleUrls: ['./listar-usuarios.component.scss']
})
export class ListarUsuariosComponent implements OnInit {
  items: any [] = [];
  form: FormGroup;
  constructor(private database: DatabaseService,
              private router: Router,
              private dialogService: NbDialogService) { }

  ngOnInit() {
    this.form = new FormGroup ({
      id: new FormControl (''),
      nombre_completo: new FormControl ('', [Validators.required]),
      dni: new FormControl ('', [Validators.required]),
      direccion: new FormControl ('', [Validators.required]),
      celular: new FormControl ('', [Validators.required]),
      email: new FormControl ('', [Validators.required, Validators.email]),
      observaciones: new FormControl ('')
    });

    this.database.get_usuarios ().subscribe ((res: any []) => {
      this.items = res;
    });
  }

  delete (item: any) {
    if (confirm("Press a button!") == true) {
      this.database.delete_usuario (item);
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
    this.database.update_usuario (this.form.value)
      .then (() => {
        dialog.close ();
        this.form.reset ();
      })
      .catch ((error: any) => {
        console.log ('update_chofer', error);
      });
  }

  registrar () {
    this.router.navigateByUrl ('pages/usuarios/agregar-usuario');
  }
}
