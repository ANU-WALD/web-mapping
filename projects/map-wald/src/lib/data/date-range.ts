import { utcDate, UTCDate } from '../time-utils.service';


// export interface LayerTimePeriod {
//   timeperiod?: number[];
// }

export interface TimeInterval {
  days?: number;
  months?: number;
  years?: number;
}

const MAXIMUM_DATE_SHIFT=60;

export class DateRange {
  start: UTCDate;
  end: UTCDate;
  format: string;
  interval?: TimeInterval;

  static dateFromConfig(json: any, end?: boolean): UTCDate {
    if (!json) {
      return new Date();
    }

    if ('number' === typeof json) {
      if (json < MAXIMUM_DATE_SHIFT) {
        let d = new Date();
        d.setUTCDate(d.getUTCDate() + json);
        return d;
      }
      if (end) {
        return utcDate(json, 11, 31);
      }

      return utcDate(json, 0, 1);
    }

    // ? expect a string and parse out dd/mm/yyyy?
    var [yyyy, mm, dd] = (json as string).split('/').map(elem => +elem);
    return new Date(yyyy, mm - 1, dd);
  }

  static fromJSON(json: any): DateRange {
    var result = new DateRange();

    if(json){
      result.start = DateRange.dateFromConfig(json.start);
      result.end = DateRange.dateFromConfig(json.end, true);
      result.format = json.format || result.format;
      result.interval = json.interval || result.interval;
    }

    return result;
  }

  containsYear(yr: number): boolean {
    return (yr >= this.start.getUTCFullYear()) &&
      (yr <= this.end.getUTCFullYear());
  }

  contains(d:UTCDate):boolean{
    let yr = d.getUTCFullYear();

    if((yr<this.start.getUTCFullYear())||
       (yr>this.end.getUTCFullYear())){
      return false;
    }

    if(yr<this.end.getUTCFullYear()){
      return true;
    }
    return d<=this.end;
  }
}
