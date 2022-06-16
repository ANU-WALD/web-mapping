/// <reference types="./leaflet.vectorgrid" />

import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as leaflet from 'leaflet';
// import 'leaflet.vectorgrid';
import { ensurePane, LeafletService } from './leaflet.service';
import { TiledSublayerDescriptor } from './data';

@Component({
  selector: 'vector-tile-layer',
  template: '',
  styles: []
})
export class VectorTileLayerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() url: string;
  @Input() styles: any;
  @Input() sublayers: TiledSublayerDescriptor[] = [];
  @Output() featureSelected = new EventEmitter<any>();
  @Input() minZoom = 0;
  @Input() maxZoom = 30;
  @Input() minNativeZoom = 11;
  @Input() maxNativeZoom = 13;
  @Input() zIndex = 100;

  private destroyed = false;
  private selectedFeature: any;
  private vectorLayer: L.VectorGridLayer;

  constructor(private map: LeafletService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.map.map.then(m=>{
      this.remove(m);
    });
  }

  private getFeatureId(f:any): string {
    const match = this.sublayers.find(v=>f.properties[v.keyField]);
    return f.properties[match.keyField];
  }

  private remove(m: L.Map): void {
    if(this.vectorLayer){
      this.vectorLayer.removeFrom(m);
      this.vectorLayer = null;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.map.map.then(m=>{
      this.remove(m);
      if(this.destroyed){
        return;
      }

      const pane = `vector-pane-${this.zIndex}`;
      ensurePane(m,pane,this.zIndex)

      this.vectorLayer = L.vectorGrid.protobuf(this.url,{
        pane,
        minZoom:this.minZoom,
        maxZoom:this.maxZoom,
        minNativeZoom:this.minNativeZoom,
        maxNativeZoom:this.maxNativeZoom,
        interactive: true,
        vectorTileLayerStyles: this.styles,
        getFeatureId: (f:any) => this.getFeatureId(f)
      });

      // if(this.featureSelected.observers.length){
        this.vectorLayer.on('click' as any,(event)=>{
          if(!this.featureSelected.observers.length){
            return;
          }

          if(this.selectedFeature){
            this.vectorLayer.resetFeatureStyle(this.selectedFeature);
          }
          this.selectedFeature = this.getFeatureId(event.layer);
          this.vectorLayer.setFeatureStyle(this.selectedFeature, {
            weight:5
          });

          const geoJSON = this.vectorGridFeatureToGeoJSON(event.layer);
          this.featureSelected.emit(geoJSON);
        });
      // }
      this.vectorLayer.addTo(m);
    });
  }

  vectorGridFeatureToGeoJSON(lyr:any):any{
    const parts:any[][] = (lyr._parts[0]&&lyr._parts[0][0])?lyr._parts:[lyr._parts];
    const points = (parts as any[]).map((part:any[])=>{
      return part.map(pt=>([pt.x,pt.y] as number[]));
    });
    const originalXs = ([] as number[]).concat(...points.map(part=>part.map(pt=>pt[0])));
    const minx = Math.min(...originalXs);//points[0].map(pt=>pt[0]));
    const maxx = Math.max(...originalXs);//points[0].map(pt=>pt[0]));

    const originalYs = ([] as number[]).concat(...points.map(part=>part.map(pt=>pt[1])));
    const miny = Math.min(...originalYs);//points[0].map(pt=>pt[1]));
    const maxy = Math.max(...originalYs);//points[0].map(pt=>pt[1]));

    function converter(from:number[],to:number[]): ((c:number)=>number) {
      const fromDelta = from[1]-from[0];
      const toDelta = to[1] - to[0];
      return (c)=>to[0] + ((c-from[0])/fromDelta) * toDelta;
    }

    const xConverter = converter([minx,maxx],[lyr.properties.minx,lyr.properties.maxx]);
    const yConverter = converter([miny,maxy],[lyr.properties.maxy,lyr.properties.miny]);

    return {
      type:'Feature',
      geometry:{
        type:'Polygon',
        coordinates:points.map(part=>part.map(pt=>[xConverter(pt[0]),yConverter(pt[1])]))
      },
      properties:lyr.properties
    };
  }

}
