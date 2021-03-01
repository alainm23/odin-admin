import { Component } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { MENU_ITEMS } from './pages-menu';

@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  templateUrl: './pages.component.html'
})
export class PagesComponent {
  constructor(private sidebarService: NbSidebarService) {
  }

  menu = MENU_ITEMS;

  toggle () {
    this.sidebarService.toggle (false, 'left');
  }
}
