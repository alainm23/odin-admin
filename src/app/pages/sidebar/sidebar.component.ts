import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  view: string = "alicorp";
  
  constructor (
    public router: Router
  ) { }

  ngOnInit() {
  }

  go_view (v: string) {
    this.view = v;
  }

  go_page (page: string) {
    this.router.navigateByUrl (page);
  }
}
