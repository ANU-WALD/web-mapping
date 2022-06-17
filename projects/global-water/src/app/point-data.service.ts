import { Injectable } from '@angular/core';
import { shareReplay, map, switchAll, tap } from 'rxjs/operators';
import { Observable, forkJoin, of } from 'rxjs';
import { TimeSeries, UTCDate } from 'map-wald';
import { Point, FeatureCollection, Feature } from 'geojson';
import { FeatureDataService, FeatureDataConfig } from './feature-data.service';
import { LayersService } from './layers.service';
import { FlattenedLayerDescriptor, LayerDescriptor } from './data';

const standardVariables = [
  'longitude',
  'latitude',
  'ID',
  'admin_country',
  'admin_province',
  'hydro_basin',
  'hydro_cat'
];

@Injectable({
  providedIn: 'root'
})
export class PointDataService {
  private layers: Observable<LayerDescriptor[]>;

  constructor(private layersService:LayersService,
              private featureData:FeatureDataService) {
    this.layers = this.layersService.matchingLayers({type:'point'}).pipe(shareReplay());

    // http.get(`${environment.pointConfig}?${(new Date()).getTime()}`).pipe(
    //   tap((cfg:FeatureDataConfig[])=>{
    //     return cfg.forEach(lyr=>{
    //       lyr.meta = [].concat(standardVariables,lyr.meta||[])
    //     });
    //   }),
    //   shareReplay());
  }

  getLayers(): Observable<FeatureDataConfig[]> {
    return this.layers;
  }

  getSites(layer: string,filter?:{[key:string]:any}): Observable<FeatureCollection> {
    return this._layerConfig(layer).pipe(
      map(lyr=>this.featureData.getFeatures(lyr,filter)),
      switchAll());
  }

  getTimes(layer: string): Observable<UTCDate[]> {
    return this._layerConfig(layer).pipe(
      map(lyr=>this.featureData.getTimes(lyr)),
      switchAll());
  }

  _computeRelative(val:number,properties:{[key:string]:any},mode:string):number{
    let prop: string;
    if(mode.includes('[')){
      prop = mode.split('[')[0];
    } else {
      prop = mode;
    }

    let comp = properties[prop];   
    if(comp&&mode.includes('[')){
      const idx = +(mode.split('[')[1].split(']')[0]);
      comp = comp[idx];
    }
    return val - comp;
  }

  _bin(val:number,bin:number[]):number{
    if(!bin?.findIndex){
      return NaN;
    }

    const idx = bin.findIndex(b=>val<=b);
    if(idx>=0){
      return idx;
    } else {
      return bin.length;
    }
  }

  getValues(layer:FlattenedLayerDescriptor, 
            filter:{[key:string]:any},
            timestep: UTCDate,
            variable?: string): Observable<FeatureCollection<Point>>{
    return this._layerConfig(layer.label).pipe(
      map(lyr=>forkJoin([of(lyr),this.featureData.getValues(lyr,filter,timestep,variable,true)])),
      switchAll(),
      map(([layer,coverage])=>{
        return {
          layer,
          coverage
        };
      }),
      tap(data=>{
        if(!data.coverage){
          return;
        }
        if(layer.relative){
          data.coverage.features.forEach(f=>{
            f.properties.value = this._computeRelative(f.properties.value,f.properties,layer.relative?.variable);
          });
        } else if(layer.bin){
          data.coverage.features.forEach(f=>{
            f.properties.value = this._bin(f.properties.value,f.properties[layer.bin]);
          });
        }
      }),
      map(data=>data.coverage));
  }

  getTimeSeries(layer:string,feature:Feature,variable?:string):Observable<TimeSeries>{
    return this._layerConfig(layer).pipe(
      map(lyr=>this.featureData.getTimeSeries(lyr,feature,variable)),
      switchAll());
  }

  private _layerConfig(lbl:string): Observable<FeatureDataConfig>{
    return this.layers.pipe(
      map(cfg => {
        return cfg.find(lyr => lyr.label === lbl);
      }));
  }
}
