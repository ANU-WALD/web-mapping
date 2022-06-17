import { Injectable } from '@angular/core';
import { Point, Feature, FeatureCollection } from 'geojson';
import { Observable, forkJoin, of } from 'rxjs';
import { TimeSeries, MetadataService, OpendapService, UTCDate } from 'map-wald';
import { map, shareReplay, switchAll, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { LayerDescriptor, MetadataConfig } from './data';
import { DapData, DapDAS, DapDDX } from 'dap-query-js/dist/dap-query';
import { HttpClient } from '@angular/common/http';
import { transpose } from 'ramda';

const DEFAULT_ID_COLUMN = 'ID';

export interface FeatureDataConfig extends LayerDescriptor {
  id?:string;
  skipGeometry?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FeatureDataService {
  private layerCache: { [key: string]: Observable<FeatureCollection<Point>> } = {};
  private dapCache: { [key: string]: Observable<DapData> } = {};
  lookups$: Observable<{ [key: string]: any }>;
  constructor(http:HttpClient, private metadata: MetadataService, private dap: OpendapService) {
    this.lookups$ = http.get(environment.attributeTranslations).pipe(shareReplay()) as Observable<{ [key: string]: any }>;
  }

  getFeatures(layer: FeatureDataConfig,filter?:{[key:string]:any}): Observable<FeatureCollection<Point>> {
    const res$ = of(layer).pipe(
      map(lyr => {
        if (!this.layerCache[lyr.label]) {
          this.layerCache[lyr.label] = this._retrieveLayer(lyr);
        }
        return this.layerCache[lyr.label];
      }),
      switchAll()
    );

    if(!filter){
      return res$;
    }

    return res$.pipe(
      map(fc=>{
        return {
          type: 'FeatureCollection',
          features: fc.features.filter(f=>{
            return Object.keys(filter).every(k=>{
              return f.properties[k]===filter[k];
            });
          })
        };
      }));
  }

  getTimes(layer: FeatureDataConfig): Observable<UTCDate[]> {
    return of(layer).pipe(
      map(cfg=>{
        const url = `${environment.tds}/dodsC/${cfg.filename}`;
        return this.metadata.getTimeDimensionForURL(url)
      }),
      switchAll()
    );
  }

  private _closestTimeIndex(date:UTCDate, dates:UTCDate[]):number {
    const dateT = date.getTime();
    const deltas = dates.map(t => Math.abs(t.getTime() - dateT));
    const closest = deltas.indexOf(Math.min(...deltas));
    return closest;
  }

  getValues(layer:FeatureDataConfig, filter:{[key:string]:any}, timestep: UTCDate, variable?: string, keepNulls?: boolean): Observable<FeatureCollection<Point>>{
    return this.getFeatures(layer).pipe(
      map((features)=>{
        const config = layer;
        variable = variable || config.variables[0];
        return {
          features,
          variable,
          config,
          url: ''
        };
      }),
      map(query=>{
        query.url = `${environment.tds}/dodsC/${query.config.filename}`;
        return forkJoin([
          this.metadata.dasForUrl(query.url),
          this.metadata.getTimeDimensionForURL(query.url),
          of(query)
        ]);
      }),
      switchAll(),
      map(([das,timeDim,query])=>{
        const featureRange = this.dap.dapRangeQuery(0,query.features.features.length-1);
        const timeStepIdx = this._closestTimeIndex(timestep,timeDim);
        if(timeStepIdx<0){
          // Error
        }
        const timeQuery =  this.dap.dapRangeQuery(timeStepIdx)
        const constraint = query.config.timeFirst ?
         `${timeQuery}${featureRange}`:
         `${featureRange}${timeQuery}`;
        return forkJoin([
          this.getDAP(`${query.url}.ascii?${query.variable}${constraint}`,das),
          of(query)
        ]);
      }),
      switchAll(),
      map(([data,query])=>{
        const vals = data[query.variable] as number[];
        const result:FeatureCollection<Point> = {
          type:'FeatureCollection',
          features:[]
        };
        result.features = query.features.features.map(f=>{
          const newF: Feature<Point> = {
            type: 'Feature',
            geometry:f.geometry,
            properties:Object.assign({},f.properties)
          };
          const idCol = layer.id||DEFAULT_ID_COLUMN;
          const idx = (data[idCol] as number[]).indexOf(newF.properties[idCol]);
          newF.properties.value = (data[query.variable] as number[])[idx];
          if(keepNulls){
            newF.properties.value = newF.properties.value || 0.0;
          }
          return newF;
        }).filter(f=>keepNulls||f.properties.value!==null)
        return result;
      }));
  }

  private getDAP(url:string,das:DapDAS):Observable<DapData>{
    if(!this.dapCache[url]){
      this.dapCache[url] = this.dap.getData(url,das).pipe(shareReplay());
    }
    return this.dapCache[url];
  }

  getTimeSeries(layer:FeatureDataConfig,feature:Feature,variable?:string):Observable<TimeSeries>{
    const res$ = this.getFeatures(layer).pipe(
      map(features=>{
        // const features:FeatureCollection = f;
        const config:FeatureDataConfig = layer;
        variable = variable || config.variables[0];
        const idCol = layer.id||DEFAULT_ID_COLUMN;
        return {
          variable,
          config,
          idx: features.features.findIndex(f=>f.properties[idCol]===feature.properties[idCol]),
          url: ''
        };
      }),
      map(query=>{
        query.url = `${environment.tds}/dodsC/${query.config.filename}`;
        return forkJoin([this.metadata.dasForUrl(query.url), this.metadata.ddxForUrl(query.url), of(query)]);
      }),
      switchAll(),
      map(([das,ddx,query])=>{
        const range = this.dap.dapRangeQuery(query.idx);

        let dateRange = '';
        if(query.config.timeFirst){
          const timeSize = +ddx.variables[query.config.time].dimensions[0].size;
          dateRange = this.dap.dapRangeQuery(0,timeSize-1);
        }
        const url = `${query.url}.ascii?${query.variable}${dateRange}${range}`;
        return forkJoin([this.getDAP(url,das),of(query)]);
      }),
      switchAll(),
      map(([data,query])=>{
        const vals = data[query.variable] as number[];
        return {
          dates:data[query.config.time] as UTCDate[],
          values:vals
        };
      }),
      map(ts=>{
        return {
          dates:ts.dates.filter((_,i)=>!isNaN(ts.values[i])&&(ts.values[i]!==null)),
          values:ts.values.filter(v=>!isNaN(v)&&(v!==null))
        };
      }));
    return res$;
  }

  private _metaFromFiles(metaConfig: MetadataConfig,idCol:string):Observable<{[key:string]:number[]}>{
    let variables = metaConfig.meta || [];
    const url = `${environment.tds}/dodsC/${metaConfig.filename}`;

    let res$ = forkJoin([this.metadata.dasForUrl(url),this.metadata.ddxForUrl(url)]).pipe(
      map(([das,ddx]) => {
        return forkJoin(variables.map(v => {
          const retrieval$ = this.getDAP(`${url}.ascii?${v}`, das as DapDAS);

          if((ddx as DapDDX).variables[v].dimensions[0].name===idCol){
            return retrieval$;
          }
          return retrieval$.pipe(
            map(data => {
              const result = Object.assign({},data);
              result[v] = transpose(data[v] as number[][]);
              return result;
            }));
        }));
      }),
      switchAll(),
      map(data=>{
        const result:{[key:string]:number[]} = {};
        data.forEach((d,i)=>{
          result[variables[i]] = d[variables[i]] as number[];
        })
        return result;
      }));
    return res$;
  }

  private _retrieveLayer(lyr: FeatureDataConfig): Observable<FeatureCollection<Point>> {
    const idCol = lyr.id||DEFAULT_ID_COLUMN;
    const coreMeta:MetadataConfig = {
      filename: lyr.filename,
      meta: ([] as string[]).concat(lyr.meta||[],[idCol,'latitude','longitude'])
    }

    let allMeta = [coreMeta];
    allMeta = allMeta.concat(lyr.relatedFiles||[]);

    let meta$ = forkJoin(allMeta.map(m=>this._metaFromFiles(m,idCol))).pipe(
      map(allMeta=>Object.assign({},...allMeta)));

    return forkJoin([meta$,this.lookups$]).pipe(
      map(metaAndLookups=>{
        return {
          meta:metaAndLookups[0],
          lookups:metaAndLookups[1]
        };
      }),
      map(metaAndLookups => {
        const data = metaAndLookups.meta;
        const lookups = metaAndLookups.lookups;
        const result: FeatureCollection<Point> = {
          type: 'FeatureCollection',
          features: []
        };

        result.features = (data[idCol] as any[]).map((_,i)=>{
          const f: Feature<Point> = {
            type: 'Feature',
            geometry: null,
            properties:{}
          };
          if(!lyr.skipGeometry){
            f.geometry = {
              type: 'Point',
              coordinates: [data.longitude[i],data.latitude[i]],
            };
          }

          Object.keys(data).filter(v=>(v!=='latitude')&&(v!=='longitude')).forEach(v=>{
            let val = data[v][i];
            if(lookups[v]&&lookups[v][val]){
              val = lookups[v][val];
            }
            f.properties[v] = val;
          });
          return f;
        });
        return result;
      }));
  }
}
