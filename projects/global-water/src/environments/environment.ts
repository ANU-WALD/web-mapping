// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  trackActions: false,
  layerConfig:'assets/config/layers.json',
  basemapConfig:'assets/config/basemaps.json',
  vectorConfig:'assets/config/foci.json',
  tds:'https://dapds00.nci.org.au/thredds',
  pointConfig:'assets/config/points.json',
  geojsons: 'assets/selection_layers/',
  attributeTranslations:'assets/lookups.json',
  tiles:'https://storage.googleapis.com/wald-vector/{{filename}}/{z}/{x}/{y}.pbf',
  splitGeoJSONS:'http://localhost:15107/062_ANU/split_polygons/{{filename}}/{{id}}.json'
  // splitGeoJSONS:'https://storage.googleapis.com/wald-vector/split_polygons/{{filename}}/{{id}}.json'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
