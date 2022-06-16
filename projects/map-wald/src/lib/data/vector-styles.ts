

export interface ScaledStyle<T extends SimpleStyleValue> {
  property: string;

  getStyleValue(feature:any): T;
}

export class CategoricalStyle<T extends SimpleStyleValue> implements ScaledStyle<T> {
  values:{[key:string]:T} = {}

  constructor(public property: string, public categories: string[]) {

  }

  getStyleValue(feature:any): T {
    return this.values[feature.properties[this.property]];
  }
}

export class RangeStyle<T extends SimpleStyleValue> implements ScaledStyle<T> {

  constructor(public property: string, public values: T[], public breakpoints: number[]){}

  idx(val:number): number {
    for(let i=1; i < this.breakpoints.length; i++) {
      if(val < this.breakpoints[i]){
        return i-1;
      }
    }
    return this.breakpoints.length - 1;
  }

  getStyleValue(feature:any): T {
    const idx = this.idx(feature.properties[this.property]);
    return this.values[idx];
  }
}

export type SimpleStyleValue = boolean | string | number;
export type StyleValue = SimpleStyleValue | ScaledStyle<SimpleStyleValue>;
