import { Component, OnInit, Input, ViewChild} from '@angular/core';
import * as L from 'leaflet';
import { environment } from '../../environments/environment';
import { parseCSV, TableRow, Bounds, InterpolationService, UTCDate, RangeStyle, PaletteService, ColourPalette } from 'map-wald';
import { ChartEntry, ChartSeries } from '../chart/chart.component';
import { LayerDescriptor, LegendResponse, MapSettings, DisplaySettings, PaletteDescriptor, 
         DisplaySettingsChange, LayerVariant, FlattenedLayerDescriptor } from '../data';
import { ConfigService } from '../config.service';
import { LeafletService, OneTimeSplashComponent, BasemapDescriptor,
  VectorLayerDescriptor, PointMode } from 'map-wald-leaflet';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import area from '@turf/area';
import { LayersService } from '../layers.service';
import { PointDataService } from '../point-data.service';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CacheService } from '../cache.service';
import { LegendUtils } from '../legend-utils';
import * as R from 'ramda';

declare var gtag: (a: string,b: string,c?: any) => void;

// const VECTOR_TILE_URL = 'https://storage.googleapis.com/wald-vector/tileserver/{z}/{x}/{y}.pbf';
// const FEATURE_ID_COL='PR_PY_PID';

const POINT_FEATURE_SIZE = 1;
const CUSTOM_POLYGON='custom-drawn';

const SUPER2='²';
const DECIMAL_PLACES=1;
const FULL_EXTENT: Bounds = {
  west: -165,
  north: 40,
  south: -40,
  east: 165
};
const DATA_COLUMNS=['date','value'];
const DEFAULT_DELTA_OFFSET=-50;
const INITIAL_OPACITY=50;//%
const DEFAULT_PALETTE:PaletteDescriptor = {
  name:'YlOrBr',
  count:6,
  reverse:false
};

const CHART_PROMPTS = {
  predefined: 'Select a region',
  draw: 'Draw a region',
  point: 'Select a point'
};

export interface FeatureStats {
  area: number;
  areaUnits: string;
}

@Component({
  selector: 'app-main-map',
  templateUrl: './main-map.component.html',
  styleUrls: ['./main-map.component.scss']
})
export class MainMapComponent implements OnInit {
  @Input() date: UTCDate;
  @Input() layer: LayerDescriptor;
  @ViewChild('splash', { static: true }) splash: OneTimeSplashComponent;

  layerDates: UTCDate[] = [];
  dateFormat = '%B/%Y';
  focusYear = -1;

  mapConfig = {
    latLngSelection: false,
    enableDrawing: false,
    showVectors: false,
    allowPolygonSelection: false
  };

  pointMode = PointMode;
  selectedFeatureNumber = 0;
  selectedPolygonFeature: GeoJSON.Feature<GeoJSON.GeometryObject>;
  polygonFeaturesForSelectedPoint: GeoJSON.FeatureCollection<GeoJSON.Polygon>;

  zoom: number;
  vectorLayers: VectorLayerDescriptor[];
  vectorLayer: VectorLayerDescriptor;
  showWindows = true;
  basemap: BasemapDescriptor;
  // transparency = 0;

  // mapRelativeMode: string; // NOT getting set when it should

  pointLayerFeatures: GeoJSON.FeatureCollection<GeoJSON.Point>;

  opacity = INITIAL_OPACITY;
  // get opacity(): number {
  //   return 1-0.01*this.transparency;
  // }

  layers: LayerDescriptor[];
  basemaps: BasemapDescriptor[];
  bounds: Bounds;
  maxBounds = Object.assign({},FULL_EXTENT);
  map: L.Map;
  mapLayer: L.TileLayer;
  baseMapURL: string;
  wmsURL:string;
  wmsParams: any = {};
  vectorStyles: any = {};
  rawChartData: ChartSeries;
  chartPolygonLabel: string;
  legend = LegendUtils.resetLegend();

  polygonMode: 'point' | 'predefined' | 'draw' = 'point';
  chartPrompt = CHART_PROMPTS;

  layerVariants:LayerVariant[] = [];
  selectedVariant:LayerVariant;
  layerSettingsFlat: FlattenedLayerDescriptor;

  featureStats: FeatureStats

  siteStyles = {
    fill: null as RangeStyle<string>,
    size: null as RangeStyle<number>
  }

  constructor(private http: CacheService,
              private appConfig: ConfigService,
              private _map: LeafletService,
              private modalService: NgbModal,
              private layersService: LayersService,
              private pointData: PointDataService,
              private palettes: PaletteService ) {
    this.resetBounds();

    this.appConfig.vectorLayers$.subscribe(layers=>{
      this.vectorLayers = layers;
      this.configureVectorLayer(layers[0]);
    });

    this.appConfig.basemaps$.subscribe(basemaps=>{
      this.basemaps = basemaps;
      this.basemap = this.basemaps[0];
      this.basemapChanged();
    });

    this.layersService.layerConfig$.subscribe(layers=>{
      this.layers = layers;
      const initialLayer = this.layers[0];
      this.setDate(initialLayer.timePeriod?.end);
      this.setLayer(initialLayer);
    });
  }

  ngOnInit(): void {
    gtag('send', 'pageview');

    // Can this go somewhere else?
    this._map.withMap(m=>{
      this.zoom = m.getZoom();
      m.on('zoom',()=>{
        this.zoom = m.getZoom();
      });
    });
  }

  updateMapConfig(): void {
    const cfg = this.mapConfig;
    const pd = this.layer?.polygonDrill;
    cfg.latLngSelection = pd && (this.polygonMode==='point');
    cfg.enableDrawing =   pd && (this.polygonMode==='draw');
    cfg.allowPolygonSelection = pd && (this.polygonMode==='predefined');
    cfg.showVectors =     true;//pd && (this.polygonMode==='predefined');
  }

  interpolationSubstitutions(): any {
    const subs:any = {};

    if(this.date){
      subs.year = this.date.getUTCFullYear();
      subs.month = pad(this.date.getUTCMonth() + 1);
      subs.day = pad(this.date.getUTCDate());
    }
    return subs;
  }

  dateChange(): void {
    this.setDate(this.date);
    this.setupDataOverlayLayer();
  }

  // TODO: Should this be layerSettingsFlat?
  mapFilename(): string {
    if(!this.layer){
      return '';
    }
    return InterpolationService.interpolate(this.layer.filename || '',this.interpolationSubstitutions());
  }

  // TODO: Should this be layerSettingsFlat?
  mapUrl(): string {
    if(!this.layer){
      return null;
    }

    if(this.layer.type!=='grid'){
      return null;
    }

    if(this.layer.source==='tds'){
      return `${environment.tds}/wms/${this.mapFilename()}`;
    }

    return this.layer.url;
  }

  variantChanged():void{
    this.setupDataOverlayLayer();
    this.chartPolygonTimeSeries();
  }

  setupDataOverlayLayer(): void {
    if(!this.layer){
      return;
    }

    this.gaEvent('layer','wms', `${this.layer.label}:${(this.date as Date).toUTCString()}`); // + ${this.relative?event.relativeVariable:'-'}

    this.flattenLayer();
    this.wmsParams = null;

    if(this.layerSettingsFlat.type==='grid'){
      this.pointLayerFeatures = null;
      this.setupWMSLayer();
    } else {
      this.setupPointLayer();
    }
  }

  private flattenLayer() {
    this.layerSettingsFlat = Object.assign({}, this.layer, this.selectedVariant);
  }

  private setupPointLayer(): void {
    let palette = this.layerSettingsFlat.palette || DEFAULT_PALETTE;
    // if(this.mapRelativeMode){
    //   palette = this.layer.relativeOptions[this.mapRelativeMode]?.palette || palette;
    // }
    const date = this.date;

    forkJoin([
      this.pointData.getValues(this.layerSettingsFlat,{},this.date,null),
      this.palettes.getPalette(palette.name,palette.reverse,palette.count)
    ]).subscribe(([features,palette]) => {
      if(this.date!==date){
        return;
      }

      this.pointLayerFeatures = features;
      this.pointLayerFeatures.features = this.pointLayerFeatures.features.filter(f=>!isNaN(f.properties.value));

      this.configurePointLegend(palette);
    });
  }

  private setupWMSLayer(): void {
    this.wmsURL = this.mapUrl();

    const options: any =  {
      layers: this.layerSettingsFlat.variable?this.layerSettingsFlat.variable:this.layerSettingsFlat.variables[0],
      opacity: this.opacity*0.01,
      updateWhenIdle: true,
      updateWhenZooming: false,
      updateInterval: 500,
      attribution: '<a href="http://wald.anu.edu.au/">WALD ANU</a>' // SHOULD LOOK AT LAYER ATTRIBUTION
    };

    this.wmsParams = interpolateAll(Object.assign({},options,this.layerSettingsFlat.mapParams||{}),
                                    this.interpolationSubstitutions());
    this.configureWMSLegend();
  }

  configurePointLegend(palette:ColourPalette): void {
    palette = palette.map(c=>c.replace(')',',0.5)').replace('rgb','rgba'));
    let breaks: number[];
    if(this.layerSettingsFlat.breaks){
      breaks = this.layerSettingsFlat.breaks;
    } else {
      const max = Math.max(
        ...(this.pointLayerFeatures.features).map(f=>f.properties.value)
                                             .filter(v=>!isNaN(v)));
      const count = palette.length;
      breaks = R.range(0,count).map(v=>0.5*max*v/(count-1));
      [0, max/10, 2*max/10, 3*max/10, 4*max/10, 5*max/10];
    }
    this.siteStyles.fill = new RangeStyle('value',palette,breaks);
    // this.siteSize = new RangeStyle('value',[1,2,3,5,8,13,21],breaks);
    this.siteStyles.size = new RangeStyle('value',[5,5,5,5,5,5,5],breaks);
    this.legend = LegendUtils.makePointLegend(palette,this.siteStyles.fill,this.layerSettingsFlat);
  }

  configureWMSLegend(): void {
    this.legend = LegendUtils.resetLegend();

    this.layersService.getLayerMetadata(this.layerSettingsFlat).subscribe(metadata=>{
      if(!metadata){
        return;
      }
      this.legend = LegendUtils.makeLegend(metadata,this.layerSettingsFlat.legendLabels);
    });
  }

  clearChart(): void {
    this.setupChart(null,null);
  }

  setupChart(layer: LayerDescriptor, chartData: ChartEntry[]): void{
    if(!layer||!chartData) {
      this.chartPolygonLabel=null;
      this.rawChartData = null;
      return;
    }

    this.rawChartData = {
      title:layer.label,
      units: layer.units,
      data:chartData
    };
  }

  mapSettingChanged(event:DisplaySettingsChange): void {
    if((this as any)[event.setting]!==undefined){
      (this as any)[event.setting] = event.value;
    }

    if(event.setting==='opacity'){
      this.setOpacity();
    }
  }

  setLayer(layer: LayerDescriptor) {
    if(this.layer===layer){
      return;
    }

    this.layer = layer;
    this.layerVariants = layer?.variants||[];
    this.selectedVariant = this.layerVariants[0];

    if(this.layer){
      this.flattenLayer();
      this.initLayerDates();
    }

    this.setupDataOverlayLayer();

    if(!this.layer?.polygonDrill){
      this.polygonMode = 'point';
    }

    if((this.layer?.type==='grid')&&this.selectedPolygonFeature){
      this.chartPolygonTimeSeries();
    } else {
      this.clearChart();
      this.selectedPolygonFeature = null;
    }

    this.updateMapConfig();
  }

  initLayerDates() {
    this.setDate(this.layersService.constrainDate(this.date,this.layer)); // Necessary?
    this.layersService.availableDates(this.layerSettingsFlat).subscribe(dates=>{
      this.layerDates = dates;

      if(this.layer.timePeriod?.format){
        this.dateFormat = this.layer.timePeriod.format;
      } else if(this.layer.timePeriod?.interval){
        const interval = this.layer.timePeriod.interval;
        if(interval.days){
          this.dateFormat = '%B %d, %Y';
        } else if(interval.months){
          this.dateFormat = '%B %Y';
        } else {
          this.dateFormat = '%Y';
        }
      }
    });
  }

  setDate(newDate: UTCDate) {
    this.date = newDate; // Necessary?
    this.focusYear = this.date.getUTCFullYear();
  }

  displayOptionsChanged(event: DisplaySettings): void {
    this.setOpacity();

    if(event.resetBounds){
      this.resetBounds();
    }

    if(event.showWindows!==undefined){
      this.showWindows = event.showWindows;
    }

    if(event.basemap){
      this.basemap = event.basemap;
      this.basemapChanged();
    }

    if(event.vectorLayer!==undefined){
      setTimeout(()=>{
        this.configureVectorLayer(event.vectorLayer);
      });
    }
  }

  pointFeatureSelected(geoJSON: any): void {
    this.clearChart();

    console.log(geoJSON);
    const layer = this.layer;
    this.pointData.getTimeSeries(layer.label,geoJSON).subscribe(timeseries=>{
      const chartData:ChartEntry[] = timeseries.dates.map((d,i)=>{
        return {
          date:d,
          value:timeseries.values[i]
        };
      }).filter(row=>(row.value!==null)&&!isNaN(row.value));
      this.setupChart(this.layerSettingsFlat,chartData);
      if(this.layer.chartLabel){
        this.chartPolygonLabel = InterpolationService.interpolate(this.layer.chartLabel,geoJSON.properties);
      } else {
        this.chartPolygonLabel=null;
      }
    });
  }
  // TODO - should Select point (ie highlight)

  pointSelected(latlng: L.LatLng): void {
    const f = makeSquareFeature(latlng);
    f.properties.source = CUSTOM_POLYGON;
    this.polygonFeaturesForSelectedPoint = makeFeatureCollection(f)
    this.setSelectedPolygonFeature(f);
  }

  polygonFeatureSelected(geoJSON: any): void {
    this.selectedFeatureNumber++;
    const currentSelection = this.selectedFeatureNumber;
    const drawn = this.mapConfig.enableDrawing;
    const polygonSource = drawn?CUSTOM_POLYGON:this.vectorLayer.name;
    geoJSON.properties.source = polygonSource;
    this.gaEvent('action','select-polygon',`${polygonSource}`);
    const realFeature$ = (this.vectorLayer.tiles&&!drawn) ? this.fetchGeoJSONForFeature(geoJSON) : of(geoJSON);

    setTimeout(()=>{
      realFeature$.subscribe(feature=>{
        if(this.selectedFeatureNumber!==currentSelection){
          return;
        }

        this.setSelectedPolygonFeature(feature);
      });
    });
  }

  setSelectedPolygonFeature(feature: GeoJSON.Feature<GeoJSON.GeometryObject>) {
    this.selectedPolygonFeature = feature;
    this.featureStats = calcFeatureStats(feature);

    this.clearChart();
    this.chartPolygonTimeSeries();
  }

  private chartPolygonTimeSeries() {
    const layer = this.layerSettingsFlat;
    if (!layer.polygonDrill||!this.selectedPolygonFeature) {
      return;
    }

    this.getPolygonTimeSeries(this.selectedPolygonFeature).subscribe(data => {
      if (!data?.length) {
        return;
      }

      if(layer!==this.layerSettingsFlat){
        return;
      }

      data = data.filter(rec => rec.value !== -9999).map(rec => {
        let theDate: Date;
        if (rec.date?.getUTCFullYear) {
          theDate = rec.date;
        } else {
          const dString = '' + rec.date;
          theDate = new Date(+dString.slice(0, 4), +dString.slice(4, 6) - 1, +dString.slice(6, 8));
        }

        const result: ChartEntry = {
          date: theDate,
          value: rec.value
        };
        return result;
      });
      // data = data.reverse();
      if ((this.selectedPolygonFeature.properties.source!==CUSTOM_POLYGON)&&this.vectorLayer.label) {
        this.chartPolygonLabel = InterpolationService.interpolate(this.vectorLayer.label, this.selectedPolygonFeature.properties);
      }
      this.setupChart(this.layerSettingsFlat, data as ChartEntry[]);
    });
  }

  fetchGeoJSONForFeature(proxyFeature:any):Observable<any>{
    const id = proxyFeature.properties[this.vectorLayer.tileLayers[0].keyField];
    const url = InterpolationService.interpolate(environment.splitGeoJSONS,Object.assign({id},this.vectorLayer,proxyFeature.properties));
    return this.http.get(url).pipe(
      map((featurecollection:any)=>featurecollection.features[0])
    );
  }

  getPolygonTimeSeries(geoJSON: any): Observable<TableRow[]> {
    if(!this.layer.polygonDrill){
      return of(null);
    }

    const currentSelection = this.selectedFeatureNumber;

    geoJSON = cleanFeature(geoJSON);
    const result$ = this.http.post(this.layer.polygonDrill,{
      product:this.layerSettingsFlat.variable,
      feature:geoJSON
    }, {
      responseType:'text'
    }).pipe(
      map(res=>{
        if(this.selectedFeatureNumber !== currentSelection) {
          return null;
        }

        const data = parseCSV(res,{
          columns:DATA_COLUMNS,
          headerRows:1
        });
        return data;
      }));
    return result$;
  }

  resetBounds(): void {
    this.bounds = Object.assign({},FULL_EXTENT);
  }

  configureVectorLayer(l: VectorLayerDescriptor): void {
    if(this.vectorLayer){
      this.gaEvent('layer', 'vector', l.name);
    }

    this.vectorLayer = l;
    if(!l||!l.tileLayers){
      return;
    }

    if(!l.tiles){
      l.tiles = InterpolationService.interpolate(environment.tiles,l);
    }

    this.vectorStyles = {};
    l.tileLayers.forEach(tl=>{
      this.vectorStyles[tl.layer] = {
        weight:0.5,
        fill:true,
        fillOpacity:0
      };
    });
  }

  setOpacity(): void {
    this.wmsParams = Object.assign({},this.wmsParams,{opacity:this.opacity*0.01});
  }

  vectorLayerChanged(vl: VectorLayerDescriptor): void {
    if((this.polygonMode==='predefined')&&
    !vl?.source&&
    !vl?.tileLayers) {
      setTimeout(()=>{
        this.polygonMode='point';
        this.updateMapConfig();
      })
    }

    this.configureVectorLayer(vl);
  }

  basemapChanged(): void {
    this.baseMapURL = this.basemap.urlTemplate;
  }

  featureSelectionModeChanged(): void {
    if((this.polygonMode==='predefined')&&
       !this.vectorLayer?.source&&
       !this.vectorLayer?.tileLayers&&
       this.vectorLayers?.length){
          setTimeout(()=>{
            const newLayer = this.vectorLayers.find((l)=>l.source||l.tileLayers);
            this.configureVectorLayer(newLayer);
          });
       }
    this.updateMapConfig();
  }

  closeAbout(): void {
    this.splash.close();
  }

  showAbout(event: any): void{
    event.stopPropagation();
    event.preventDefault();
    this.splash.show();
  }

  gaEvent(category: string, action: string, context: string): void {
    if(!environment.trackActions){
      return;
    }

    gtag('event', 'category', {
      event_category: action,
      event_label: context
    });
  }
}

function interpolateAll(params: any, subs: any) {
  const result: any = {};
  Object.keys(params).forEach(k => {
    if (typeof (k) === 'string') {
      result[k] = InterpolationService.interpolate(params[k], subs);
    } else {
      result[k] = params[k];
    }
  });

  return result;
}

function pad(n: number,digits?: number): string{
  digits = digits || 2;

  let result = n.toString();
  while (result.length<digits){
    result = '0' + result;
  }
  return result;
}

function makeFeatureCollection(...features:GeoJSON.Feature<GeoJSON.Polygon>[]):GeoJSON.FeatureCollection<GeoJSON.Polygon>{
  return {
    type:'FeatureCollection',
    features:features
  };
}

function makeSquareFeature(latlng: L.LatLng): GeoJSON.Feature<GeoJSON.Polygon> {
  const w = latlng.lng - POINT_FEATURE_SIZE/2;
  const e = latlng.lng + POINT_FEATURE_SIZE/2;
  const n = latlng.lat + POINT_FEATURE_SIZE/2;
  const s = latlng.lat - POINT_FEATURE_SIZE/2;

  const square = [[
    [w,n],
    [w,s],
    [e,s],
    [e,n],
    [w,n]
  ]];

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: square
    },
    properties: {
    }
  };
}

function calcFeatureStats(feature:any): FeatureStats {
  const result = {
    area: area(feature),
    areaUnits:'m' + SUPER2
  };

  if (result.area > 10000) {
    if(result.area>1000000){
      result.area /= 1000000;
      result.areaUnits = 'km' + SUPER2;
    } else {
      result.area /= 10000;
      result.areaUnits = 'ha';
    }
  }
  result.area = +result.area.toFixed(DECIMAL_PLACES);
  return result;
}

function cleanFeature(geoJSON:any):any {
  let points:number[][][] = geoJSON.geometry.coordinates;
  let shiftEast = false;
  let shiftWest = false; 
  do{
    shiftEast = points.every(poly=>poly.every(point=>point[0]<-180));
    shiftWest = points.every(poly=>poly.every(point=>point[0]>180));

    const shift = function(direction:number) {
      return points.map(poly=>poly.map(point=>[point[0]+direction,point[1]]));
    };

    if(shiftEast){
      points = shift(360);
    } else if(shiftWest){
      points = shift(-360);
    }
  } while(shiftEast||shiftWest);

  geoJSON.geometry.coordinates = points;
  return geoJSON;
}
