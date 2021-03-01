import { Component, OnInit } from '@angular/core';

// Services
import { DatabaseService } from '../../../services/database.service';

// Search Provider
import { environment } from '../../../../environments/environment';
const algoliasearch = require('algoliasearch');

@Component({
  selector: 'ngx-registrar-operacion-lote',
  templateUrl: './registrar-operacion-lote.component.html',
  styleUrls: ['./registrar-operacion-lote.component.scss']
})
export class RegistrarOperacionLoteComponent implements OnInit {
  search_term: string;
  algolia_index: any;

  resultado: any [] = [];
  items: any [] = [];
  constructor (
    private database: DatabaseService
  ) { }

  ngOnInit() {
    const client = algoliasearch (environment.algolia.appId, environment.algolia.apiKey);
    this.algolia_index = client.initIndex (environment.algolia.indexName);
  }

  search_changed () {
    if (this.search_term != "") {
      this.algolia_index.search (this.search_term).then((data: any)=>{
        this.resultado = [];
        if (data.hits.length > 0) {
          this.resultado = data.hits;
        }
      });
    } else {

    }
  }

  add_item (item: any) {
    console.log (this.items);

    if (!this.existe (item)) {
      this.items.push (item);
    } else {
      alert ("El producto esta repetido, no se puede agregar.");
    }

    this.search_term = "";
    this.resultado = [];
  }

  agregar_bloque () {
    console.log (this.items);

    if (this.items.length > 0) {
      this.database.agregar_bloque_productos (this.items);
    }
  }

  existe (item: any) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].objectID === item.objectID) {
        return true;
      }
    }

    return false;
  }

  eliminar (item: any) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].objectID === item.objectID) {
        this.items.splice(i, 1);
      }
    }
  }
}
