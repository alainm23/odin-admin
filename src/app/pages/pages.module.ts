import { NgModule } from '@angular/core';
import { NbMenuModule, NbSidebarModule, NbLayoutModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { HomeModule } from './home/home.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    HomeModule,
    MiscellaneousModule,
    NbSidebarModule,
    NbLayoutModule
  ],
  declarations: [
    PagesComponent,
    SidebarComponent
  ],
})
export class PagesModule {
}
