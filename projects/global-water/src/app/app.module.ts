import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MapWaldCoreModule } from 'map-wald';
import { MapWaldLeafletModule } from 'map-wald-leaflet';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MainMapComponent } from './main-map/main-map.component';
import { MapControlsComponent } from './map-controls/map-controls.component';
import { MapButtonsComponent } from './map-buttons/map-buttons.component';
import { ChartComponent } from './chart/chart.component';
import { VectorLayerSelectionComponent } from './vector-layer-selection/vector-layer-selection.component';
import { AboutComponent } from './about/about.component';
// import { DownloadFormComponent } from './download-form/download-form.component';
import { FeatureDataService } from './feature-data.service';
import { PointDataService } from './point-data.service';
import { LayersService } from './layers.service';
import { DisplaySettingsComponent } from './display-settings/display-settings.component';
import { OpacitySliderComponent } from './opacity-slider/opacity-slider.component';
import { TimeSliderComponent } from './time-slider/time-slider.component';
import { MultiYearTimeseriesChartComponent } from './multi-year-timeseries-chart/multi-year-timeseries-chart.component';
import { LogoBlockComponent } from './logo-block/logo-block.component';

@NgModule({
  declarations: [
    AppComponent,
    MainMapComponent,
    MapControlsComponent,
    MapButtonsComponent,
    ChartComponent,
    VectorLayerSelectionComponent,
    AboutComponent,
    DisplaySettingsComponent,
    OpacitySliderComponent,
    TimeSliderComponent,
    MultiYearTimeseriesChartComponent,
    LogoBlockComponent,
    // DownloadFormComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule,
    MapWaldCoreModule.forRoot({}),
    MapWaldLeafletModule.forRoot({})
  ],
  providers: [
    FeatureDataService,
    PointDataService,
    LayersService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
