import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.vectorgrid';
import { LeafletService, ensurePane } from './leaflet.service';
import { TiledSublayerDescriptor } from './data';
import { HttpClient } from '@angular/common/http';
import { ScaledStyle, StyleValue } from 'map-wald';
import { Feature } from 'geojson';

const STYLES = {
  fillOpacity: 0.0,
  weight: 1.0
};

export enum PointMode {
  default,
  circle
}

@Component({
  selector: 'geojson-layer',
  template: '',
  styles: ['']
})
export class GeojsonLayerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() url: string;
  @Input() features: any;
  // @Input() styles: any;
  @Input() sublayers: TiledSublayerDescriptor[] = [];
  @Input() pointMode:PointMode = PointMode.default;
  @Input() style: {[key:string]:StyleValue} = {};
  // @Input() idColumn = 'id';
  @Output() featureSelected = new EventEmitter<any>();
  @Input() zIndex = 100;

  private destroyed = false;
  private selectedFeature: any;
  private vectorLayer: L.GeoJSON;
  // private data: any;

  constructor(private http: HttpClient, private map: LeafletService) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.map.map.then(m => {
      this.remove(m);
    });
  }

  private remove(m: L.Map): void {
    if (this.vectorLayer) {
      this.vectorLayer.removeFrom(m);
      this.vectorLayer = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.url) {
      this.downloadLayer(changes.url.currentValue);
    } else if(changes.features||changes.pointMode){
      this.makeLayer();
    }
  }

  downloadLayer(url:string): void {
    this.http.get(this.url).subscribe((data: any) => {
      if (url !== this.url) {
        // out of date!
        return;
      }
      this.features = data;

      this.makeLayer();
    });
  }

  makeLayer(): void {
    this.map.map.then(m => {
      this.remove(m);
      if (this.destroyed) {
        return;
      }

      const style = (f: any)=>{
        const styles: {[key:string]:any} = Object.assign({},STYLES);
        Object.keys(this.style).forEach(k=>{
          const val = this.style[k];
          if((val as ScaledStyle<any>).getStyleValue) {
            styles[k] = (val as ScaledStyle<any>).getStyleValue(f);
          } else {
            styles[k] = val;
          }
        });
        return styles;
      };

      const options:L.GeoJSONOptions = {
        // interactive: true
        style: style
      };

      if(this.pointMode===PointMode.circle){
        options.pointToLayer = (feature, latlng) => {
          let radius = 3;
          if(this.style && this.style.radius) {
            if((this.style.radius as ScaledStyle<number>).getStyleValue){
              radius = (this.style.radius as ScaledStyle<number>).getStyleValue(feature);
            } else {
              radius = this.style.radius as number;
            }
          }
          return L.circleMarker(latlng,{radius:radius});
        };
      }

      const pane = `vector-pane-${this.zIndex}`;
      ensurePane(m,pane,this.zIndex)
      options.pane = pane;
      this.vectorLayer = L.geoJSON(this.features, options);

      this.vectorLayer.on('click' as any, (event) => {
        if (this.selectedFeature) {
          this.vectorLayer.resetStyle(this.selectedFeature);
          // resetFeatureStyle(this.selectedFeature);
        }
        this.selectedFeature = event.layer;
        this.selectedFeature.setStyle({
          weight:5
        });

        this.featureSelected.emit(this.selectedFeature.feature);
      });
      this.vectorLayer.addTo(m);
    });
  }
}
