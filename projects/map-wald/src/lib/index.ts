import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { TreeFilterService } from './tree-filter.service';
import { PaletteService } from './palette.service';
import { TimeUtilsService } from './time-utils.service';
import { StaticDataService } from './static-data.service';
import { MetadataService } from './metadata.service';
import { OpendapService } from './opendap.service';
import { TimeseriesService } from './timeseries.service';
import { PointSelectionService } from './point-selection.service';
import { AvailableDatesService } from './available-dates.service';
import { CatalogService } from './catalog.service';
import { MapViewParameterService } from './map-view.service';
import { WMSService } from './wms.service';
import { ProjectionService } from './projection.service';

export * from './data';

export * from './wms.service';
export * from './projection.service';
export * from './map-view.service';
export * from './interpolation.service';
export * from './available-dates.service';
export * from './point-selection.service';
export * from './metadata.service';
export * from './catalog.service';
export * from './palette.service';
export * from './static-data.service';
export * from './opendap.service';
export * from './timeseries.service';
export * from './time-utils.service';
export * from './tree-filter.service';

export * from './parsing/csv';

const services = [
  //$serviceList
  AvailableDatesService,
  PointSelectionService,
  TimeseriesService,
  StaticDataService,
  MetadataService,
  OpendapService,
  PaletteService,
  TimeUtilsService,
  WMSService,
  MapViewParameterService,
  ProjectionService,
  CatalogService,
  TreeFilterService
];

//import { CSVService } from './src/csv.service';

//$importList

//$exportList


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  declarations: [],
  exports: [],
  providers: services
})
export class MapWaldCoreModule {
  static forRoot(moduleInitialisation: any): ModuleWithProviders<MapWaldCoreModule> {
    return {
      ngModule: MapWaldCoreModule,
      providers: services
    };
  }
}

