import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

import { DatabaseService } from "../services/database.service";
import { Router } from '@angular/router';
import { NbMenuService } from '@nebular/theme';

import { first } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public afAuth: AngularFireAuth,
    public router: Router,
    private menuService: NbMenuService,
    public database: DatabaseService) {}

  async isLogin () {
    return await this.afAuth.authState.pipe (first ()).toPromise ();
  }

  public authState () {
    return this.afAuth.authState;
  }

  public signInWithEmailAndPassword (email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword (email, password);
  }

  public signOut () {
    return this.afAuth.auth.signOut ();
  }
}
