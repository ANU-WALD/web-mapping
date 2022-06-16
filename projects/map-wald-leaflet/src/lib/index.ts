import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MapWaldCoreModule } from 'map-wald';

import { LeafletService } from './leaflet.service';
import { LeafletMapComponent } from './leaflet-map.component';
import { DrawComponent } from './draw.component';
import { GeojsonLayerComponent } from './geojson-layer.component';
import { LegendComponent } from './legend.component';
import { MapControlComponent } from './map-control.component';
import { OneTimeSplashComponent } from './one-time-splash.component';
import { VectorTileLayerComponent } from './vector-tile-layer.component';
import { WmsLayerComponent } from './wms-layer.component';
import { DateElementComponent } from './date-element.component';
import { DateSelectionComponent } from './date-selection.component';
import { MapCoordinatesComponent } from './map-coordinates.component';

export * from './data';
export * from './leaflet.service';
export * from './leaflet-map.component';
export * from './draw.component';
export * from './geojson-layer.component';
export * from './legend.component';
export * from './map-control.component';
export * from './one-time-splash.component';
export * from './vector-tile-layer.component';
export * from './wms-layer.component';
export * from './date-element.component';
export * from './date-selection.component';
export * from './map-coordinates.component';

const components: any[] = [
  //$componentList
  DrawComponent,
  GeojsonLayerComponent,
  LeafletMapComponent,
  LegendComponent,
  MapControlComponent,
  OneTimeSplashComponent,
  VectorTileLayerComponent,
  WmsLayerComponent,
  DateElementComponent,
  DateSelectionComponent,
  MapCoordinatesComponent
];

const services: any[] = [
  //$serviceList
  LeafletService  
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    MapWaldCoreModule
  ],
  declarations: components,
  exports: components,
  providers: services
})
export class MapWaldLeafletModule {
  static forRoot(moduleInitialisation:any): ModuleWithProviders<MapWaldLeafletModule> {
    return {
      ngModule: MapWaldLeafletModule,
      providers: services
    };
  }
}
