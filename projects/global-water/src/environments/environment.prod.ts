export const environment = {
  production: true,
  trackActions: true,
  layerConfig:'assets/config/layers.json',
  basemapConfig:'assets/config/basemaps.json',
  vectorConfig:'assets/config/foci.json',
  tds:'https://dapds00.nci.org.au/thredds',
  pointConfig:'assets/config/points.json',
  geojsons: 'assets/selection_layers/',
  attributeTranslations:'assets/lookups.json',
  tiles:'https://storage.googleapis.com/wald-vector/{{filename}}/{z}/{x}/{y}.pbf',
  splitGeoJSONS:'https://storage.googleapis.com/wald-vector/split_polygons/{{filename}}/{{id}}.json'
};
