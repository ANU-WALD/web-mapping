import { RangeStyle } from "map-wald";
import { FlattenedLayerDescriptor, LegendResponse } from "./data";
import * as R from 'ramda';
import { makeColour } from "map-wald-leaflet";

export interface LegendConfig {
  colours: string[],
  labels: string[],
  shape: string[]
}

// @dynamic
export class LegendUtils {
  static resetLegend(): LegendConfig {
    return {
      colours: [],
      labels: [],
      shape: []
    };
  }

  static getLabels(range: RangeStyle<any>, digits?: number): string[] {
      const fmt = (v: number) => v.toFixed(digits || 0);
      return range.breakpoints.map((b, i) => {
          if (i < (range.breakpoints.length - 1)) {
              return `${fmt(b)}-${fmt(range.breakpoints[i + 1])}`;
          }
          return `> ${fmt(b)}`;
      })
  }
  static makeLegend(metadata: LegendResponse, labels?: string[]): LegendConfig {
    const result = LegendUtils.resetLegend();
    result.colours = R.uniq(metadata.palette.map(c => makeColour(c.R, c.G, c.B, c.A / 255)).reverse());
    result.shape[0] = '';
    if (labels) {
      result.labels = labels;
    } else {
      let vals: number[];
      if (metadata.values) {
        vals = metadata.values;
      } else {
        const range = metadata.max_value - metadata.min_value;
        const step = range / (result.colours.length - 2);
        vals = [metadata.min_value];
        for (let i = 1; i < result.colours.length - 1; i++) {
          vals.push(vals[i - 1] + step);
        }
        vals.push(metadata.max_value);
        console.assert(vals.length === metadata.palette.length);
      }
      result.labels = vals.map((v, i) => {
        const txt = v.toFixed();
        if (!i) {
          return `< ${txt}`;
        }
        if (i === vals.length - 1) {
          return `> ${txt}`;
        }
        return `${vals[i - 1].toFixed()}-${txt}`;
      }).reverse();
    }
    return result;
  }

  static makePointLegend(palette: string[], fill: RangeStyle<string>, layer?: FlattenedLayerDescriptor): LegendConfig {
    let labels = layer?.legendLabels;
    if(!labels){
      labels = LegendUtils.getLabels(fill).reverse();
      if(layer.units){
        labels = labels.map(l => `${l} ${layer.units}`);
      }
    } 
    return {
      colours: palette.slice().reverse(),
      labels: labels,// Should be significant digits
      shape: ['circle']
    };
  }
}