import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

// Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';

// NgxCharts
import { NgxChartsModule } from '@swimlane/ngx-charts';

// Application components
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SensorChartComponent } from './components/charts/sensor-chart.component';
import { WTPDashboardComponent } from './components/wtp-dashboard/wtp-dashboard.component';

// Services
import { SensorDataService } from './services/sensor-data.service';

const routes: Routes = [
  { path: '', redirectTo: '/wtp-dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'wtp-dashboard', component: WTPDashboardComponent },
  { path: '**', redirectTo: '/wtp-dashboard' }
];

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SensorChartComponent,
    WTPDashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    
    // Angular Material modules
    MatToolbarModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatChipsModule,
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    
    // NgxCharts
    NgxChartsModule
  ],
  providers: [
    SensorDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
