import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { UTCDate } from './time-utils.service';
import { MappedLayer } from './data/mapped-layer';
import { map } from 'rxjs/operators';
import { InterpolationService } from './interpolation.service';
import { MetadataService } from './metadata.service';
import { Layer } from './data/catalog';

@Injectable()
export class AvailableDatesService {

  constructor(private metadata:MetadataService) {

  }

  private fnForYear(mapped:MappedLayer,year:number){
    const publication = mapped.layer.publications[mapped.options.publication];
    return InterpolationService.interpolate(publication.options.filepath, {
      year: year
    });
  }

  availableDates(mapped:MappedLayer,year?:number):Observable<UTCDate[]>{
    let layer = mapped.layer;
    let fn = this.fnForYear(mapped,year);

    let res$ = this.metadata.getTimeDimension(layer.options.host,fn);

    if(!layer.timeshift){
      return res$;
    }

    if(layer.timePeriod.containsYear(year-1)){
      fn = this.fnForYear(mapped,year-1);

      let prev$ = this.metadata.getTimeDimension(layer.host,fn);

      res$ = forkJoin(...[prev$,res$]).pipe(
        map((years:Date[][])=> years[0].concat(years[1])));
    }

    return res$.pipe(
        map(dates=>{
          return dates.map(d=>{
            let res = new Date(d.getTime());
            res.setUTCDate(d.getUTCDate()-layer.timeshift*layer.timestep);
            return res;
          });
        }),
        map(dates=>dates.filter((d,i)=>(i>=Math.abs(layer.timeshift))&&(d.getUTCFullYear()===year)))
    );
  }
}
