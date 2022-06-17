import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { UTCDate } from 'map-wald';
// import * as Plotly from 'plotly.js/dist/plotly-basic';
import * as Plotly from 'plotly.js-dist-min';

export interface ChartEntry {
  date: UTCDate;
  value: number;
  text?: string;
}

export interface ChartSeries {
  title: string;
  data: ChartEntry[];
  units: string;
  colour?: string;
  mode?:string;
  markerSize?:number;
  textposition?:string;
  hoverinfo?:string;
}

const MAIN_COLOUR='#3c4172';
const SAT_COLOUR='#dee1ff';

@Component({
  selector: 'app-chart',
  template: `<div id="chart-div"></div>
  `,
  styles: []
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() title: string;
  @Input() axisLabel: string;
  @Input() series: ChartSeries[];
  @Input() x = 'year';
  @Input() y = 'value';
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.buildChart();
  }

  buildChart(): void {
    if(!this.series||!this.series.length){
      return;
    }

    const node = document.getElementById('chart-div');
    // const chartData = this.series[0].data;
    Plotly.purge(node);

    const series = this.series.map((chartData,ix)=>{
      const col = chartData.colour || (ix ? SAT_COLOUR : MAIN_COLOUR);
      return {
        x: chartData.data.map(r=>(r as any)[this.x]),
        y: chartData.data.map(r=>(r as any)[this.y]),
        text: chartData.data[0].text?chartData.data.map(r=>r.text):undefined,
        textposition: chartData.textposition,
        name: chartData.title,
        mode: chartData.mode || 'lines+markers',
        hoverinfo: chartData.hoverinfo,
        connectgaps: true,
        marker: {
          size: chartData.markerSize===undefined ? (ix ? 2 : 6) : chartData.markerSize,
          color: 'rgba(0,0,0,0)',
          line: {
            color: col,
            width: 1
          }
        },
        line: {
          color: col
        }
      };
    }).reverse();

    const axisTitle = this.axisLabel || this.series[0].units || '';
    Plotly.plot(node, series, {
      margin: {
        t: 40,
        l: axisTitle ? 50 : 30,
        r: 10,
        b: 30
      },
      yaxis: {
        hoverformat: '.2f',
        title: axisTitle,
        fixedrange: true,
        // range: yRange
      },
      height: 200,
      width: 520, //600,
      title: this.title,
      showlegend: false
    },
    {
      displaylogo: false,
      displayModeBar: true,
      modeBarButtonsToRemove: ['hoverCompareCartesian', 'hoverClosestCartesian',
        'lasso2d', 'select2d', 'toggleSpikelines', 'resetViews', 'sendDataToCloud',
        'zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'autoScale2d'/*, 'resetScale2d'*/]
    });
  }
}

