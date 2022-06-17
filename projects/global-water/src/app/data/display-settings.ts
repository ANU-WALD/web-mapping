import { BasemapDescriptor, VectorLayerDescriptor } from 'map-wald-leaflet';

export interface DisplaySettingsChange {
  setting: string;
  value: any;
}

export interface DisplaySettings {
  opacity?: number;
  basemap?: BasemapDescriptor;
  vectorLayer?: VectorLayerDescriptor;
  resetBounds?: boolean;
  showWindows?: boolean;
}

