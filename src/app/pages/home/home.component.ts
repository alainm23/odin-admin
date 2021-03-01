import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as XLSX from 'xlsx';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'ngx-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  willDownload = false;
  constructor(private utils: UtilsService) { }

  ngOnInit() {

  }
}
