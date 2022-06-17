import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UTCDate } from 'map-wald';
import { ChartEntry, ChartSeries } from '../chart/chart.component';
import {groupBy} from 'ramda';
import * as FileSaver from 'file-saver';
import * as R from 'ramda';

const CM_NORMAL='Time series';
const CM_DEVIATION='Deviation from monthly mean';
const CM_YR_ON_YR='Year on year';
const CM_YR_ON_YR_CUMUL='Year on year (cumulative)';

@Component({
  selector: 'app-multi-year-timeseries-chart',
  templateUrl: './multi-year-timeseries-chart.component.html',
  styleUrls: ['./multi-year-timeseries-chart.component.scss']
})
export class MultiYearTimeseriesChartComponent implements OnInit, OnChanges {
  @Input() chartSeries: ChartSeries;
  @Input() chartLabel = '';
  @Input() focusYear = -1;

  chartModes = [CM_NORMAL,CM_DEVIATION,CM_YR_ON_YR,CM_YR_ON_YR_CUMUL];
  chartMode = CM_YR_ON_YR;

  effectiveChartSeries: ChartSeries[] = [];


  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.chartSeries||changes.focusYear){
      this.configureChartMode();
    }
  }

  ngOnInit(): void {
  }

  configureChartMode(): void {
    if(!this.chartSeries?.data?.length){
      this.effectiveChartSeries = [];
      return;
    }

    switch(this.chartMode){
      case CM_NORMAL:
        this.effectiveChartSeries = [
          this.chartSeries
        ];
        break;
      case CM_DEVIATION:
        this.effectiveChartSeries = [
          {
            title: this.chartSeries.title,
            units: this.chartSeries.units,
            data: convertToMonthlyVariance(this.chartSeries.data)
          }
        ];
        break;
      case CM_YR_ON_YR:
      case CM_YR_ON_YR_CUMUL:
        const orig = this.chartSeries.data;
        const groups = groupBy(r=>(r.date as UTCDate).getUTCFullYear().toString(),orig);
        const years = Object.keys(groups).map(yr=>+yr).sort().reverse();
        const maxYear = years[0];
        this.effectiveChartSeries = years.map((yr,i)=>{
          const result:ChartSeries = {
            title: `${this.chartSeries.title}: ${yr}`,
            units: this.chartSeries.units,
            data: groups[yr.toString()].map(r=>{
              const d = new Date(r.date as Date);
              d.setUTCFullYear(maxYear);
              return {
                date:d,
                value:r.value
              };
            })
          };
          if(this.chartMode===CM_YR_ON_YR_CUMUL){
            result.data = toCumulative(result.data/*.reverse()*/);
          }

          result.hoverinfo=i?'none':'x+y'

          return result;
        });
        if(this.focusYear>0){
          const idx = years.indexOf(this.focusYear);
          if(idx>0){
            const focusYear = this.effectiveChartSeries.splice(idx,1)[0];
            this.effectiveChartSeries.splice(0,0,focusYear);
          }
        }

        const makeExtremity = (lbl:string,fn:((...arr:number[])=>number),pos:string) => {
          const seriesLen = 12;
          const result = {
            title: lbl,
            units: this.chartSeries.units,
            data: R.range(0,seriesLen).map(i=>{
              const d = new Date(Date.UTC(maxYear,i,15));
              const seriesSummary = this.effectiveChartSeries.map(s=>{
                const vals = s.data.filter(r=>r.date.getUTCMonth()===i).map(r=>r.value)
                if(!vals.length){
                  return undefined;
                }
                return fn(...vals);
              });
              const monthlyVals = seriesSummary.filter(v=>v!==undefined);
              if(!monthlyVals.length){
                return null;
              }
              const v = fn(...monthlyVals);
              const sourceOfExtremity = seriesSummary.indexOf(v);
              return {
                date:d,
                value:v,
                text:this.effectiveChartSeries[sourceOfExtremity].title.split(': ')[1]
              };
            }).filter(r=>r!==null),
            colour:'red',
            mode:'markers+text',
            markerSize:10,
            textposition:pos,
            hoverinfo:'y',
          };
          return result;
        };
        this.effectiveChartSeries.push(makeExtremity('Min',Math.min,'bottom'));
        this.effectiveChartSeries.push(makeExtremity('Max',Math.max,'top'));
        break;
    }
  }

  downloadClick(): void {
    const fileName = `global-water-monitor-${this.chartSeries.title}-${this.chartLabel}.csv`;

    const output = new Blob(
      [this.makeCSV()],
      {type: 'text/plain;charset=utf-8'});
    FileSaver.saveAs(output, fileName);
  }

  makeCSV(): string {
    const res = ([] as string[]).concat(
      ['date,value'],
      this.chartSeries.data.map(r=>`${r.date},${r.value}`))
    return res.join('\n');
  }
}

function toCumulative(table:ChartEntry[]):ChartEntry[] {
  let sum = 0.0;
  return table.map(row=>{
    sum += row.value;
    return {
      date:row.date,
      value:sum
    };
  });
}

function convertToMonthlyVariance(chartData: ChartEntry[]): ChartEntry[] {
  const monthlyTotals = new Array<number>(12).fill(0);
  const monthlyCounts = new Array<number>(12).fill(0);
  chartData.forEach(row=>{
    const month = (row.date as UTCDate).getUTCMonth();
    monthlyTotals[month] += row.value;
    monthlyCounts[month]++;
  });
  const monthlyMeans = monthlyCounts.map((c,i)=>(c?(monthlyTotals[i]/c):NaN));
  return chartData.map(row=>{
    return {
      date:row.date,
      value:row.value - monthlyMeans[(row.date as UTCDate).getUTCMonth()]
    };
  });
}

