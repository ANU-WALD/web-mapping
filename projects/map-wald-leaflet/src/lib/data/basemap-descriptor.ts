

export interface BasemapDescriptor {
  name: string;
  icon: string;
  urlTemplate: string;
  shade: 'light' | 'dark';
  maxNativeZoom?: number;
}
