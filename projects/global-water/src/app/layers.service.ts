import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, publishReplay, refCount, switchAll, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { LayerDescriptor } from './data';
import { DateRange, InterpolationService, UTCDate } from 'map-wald';
import { FeatureDataService } from './feature-data.service';
import { CacheService } from './cache.service';

const DEFAULT_ATTRIBUTION_TEXT='ANU Centre for Water and Landscape Dynamics';
const DEFAULT_ATTRIBUTION_URL='http://wald.anu.edu.au/';
const DEFAULT_LAYER_SETTINGS={
  attribution:DEFAULT_ATTRIBUTION_TEXT,
  attributionURL:DEFAULT_ATTRIBUTION_URL
}

@Injectable({
  providedIn: 'root'
})
export class LayersService {
  layerConfig$: Observable<LayerDescriptor[]>;

  constructor(private http: CacheService,
              private featureData: FeatureDataService) {
    const url = `${environment.layerConfig}?_=${(new Date()).getTime()}`;
    this.layerConfig$ = this.http.get(url).pipe(
      map((origLayers:LayerDescriptor[])=>{
        const constants:any = origLayers.filter(l=>l.type==='constants')[0];
        let layers:LayerDescriptor[] = origLayers.filter(l=>l.type!=='constants');
        layers = layers.map(l=>{
          return Object.assign({},DEFAULT_LAYER_SETTINGS,l)
        });

        if(constants){
          layers.forEach(l=>{
            this.substituteConstants(l, constants);
          });
        }

        return layers;
      }),
      map((rawLayers:LayerDescriptor[])=>{
        return forkJoin(rawLayers.map(l=>{
          if(l.timePeriod){
            l.timePeriod = DateRange.fromJSON(l.timePeriod);
          } else if(l.time) {
            // infer time period
            return this.featureData.getTimes(l).pipe(
              map(times=>{
                l.timePeriod = new DateRange();
                l.timePeriod.start = times[0];
                l.timePeriod.end = times[times.length-1];
                return l;
              })
            );
          }
          return of(l);
        }));
      }),
      switchAll(),
      publishReplay(),
      refCount()) as Observable<LayerDescriptor[]>;
  }

  private substituteConstants(l: LayerDescriptor, constants: any) {
    Object.keys(l).forEach(k => {
      const val = (l as any)[k];
      if ((typeof (val) === 'string') && val.startsWith('$') && val.endsWith('$')) {
        (l as any)[k] = constants[val.slice(1, -1)];
      } else if (typeof (val) === 'object') {
        this.substituteConstants(val, constants);
      }
    });
  }

  matchingLayers(params?: any): Observable<LayerDescriptor[]>{
    if(!params){
      return this.layerConfig$;
    }

    const keys = Object.keys(params);

    if(keys.length){
      return this.layerConfig$;
    }

    return this.layerConfig$.pipe(
      map(allLayers=>{
        return allLayers.filter(l=>{
          return keys.every(k=>(l as any)[k]===params[k]);
        });
      })
    );
  }

  constrainDate(d: UTCDate, lyr: LayerDescriptor): UTCDate {
    if(!lyr.timePeriod){
      return d;
    }
    if(lyr.timePeriod.contains(d)){
      return d;
    }
    if(d.getTime()<lyr.timePeriod.start.getTime()){
      return lyr.timePeriod.start;
    }
    return lyr.timePeriod.end;
  }

  availableDates(lyr:LayerDescriptor): Observable<UTCDate[]>{
    if(!lyr?.timePeriod){
      return of([]);
    }

    if(lyr.type==='grid'){
      if(lyr.metadata){
        return this.getLayerMetadata(lyr).pipe(
          map(metadata=>{
            const dates = ((metadata.dates_iso8601||[]) as string[]).map(d=>new Date(d));
            return dates;
          })
        );
      }


      const interval = lyr.timePeriod.interval || {days:1};
      let d = lyr.timePeriod.start;
      const result:UTCDate[] = [];
      while(d<=lyr.timePeriod.end){
        result.push(d);
        d = new Date(d.getTime());
        if(interval.years){
          d.setUTCFullYear(d.getUTCFullYear()+interval.years);
        }
        if(interval.months){
          d.setUTCMonth(d.getUTCMonth()+interval.months);
        }
        if(interval.days){
          d.setUTCDate(d.getUTCDate()+interval.days);
        }
      }

      return of(result);
    }

    return this.featureData.getTimes(lyr);
  }

  getLayerMetadata(flatLayer:LayerDescriptor): Observable<any>{
    if(!flatLayer?.metadata){
      return of(null);
    }

    const url = InterpolationService.interpolate(
      flatLayer.metadata,flatLayer);

    return this.http.get(url);
  }
}
