import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { InterpolationService, UTCDate } from 'map-wald';
import * as d3 from 'd3-time-format';

const TICK_COLOUR='#000';
const BACKGROUND_COLOUR='#58723C';
const TICK_SIZE=0.2;//%
const TICK_FREQUENCY = 5; // years
const MOUSE_LEAVE_DEBOUNCE=1500; // ms

const SLIDER_STYLE = `input[type="range"].time-slider::-moz-range-track {
  background: {{gradient}}
  height:5px !important;
}


input[type="range"].time-slider::-webkit-slider-runnable-track {
  height:5px !important;
  background: {{gradient}}
}

input[type=range].time-slider::-webkit-slider-thumb {
	position: relative;
  top: -5px;
}
`;
const GRADIENT = 'linear-gradient(to right, ';

@Component({
  selector: 'app-time-slider',
  templateUrl: './time-slider.component.html',
  styleUrls: ['./time-slider.component.scss']
})
export class TimeSliderComponent implements OnChanges {
  @Input() dates: UTCDate[] = [];
  @Input() format: string;

  @Input() date: UTCDate = new Date();
  @Output() dateChange = new EventEmitter<UTCDate>();

  firstDate = {year: 1979, month: 1, day: 1};
  lastDate = {year: 2048, month: 12, day: 31};
  ngbDate = {year:0,month:0,day:0};

  userSet = false;
  oldStep = -1;
  currentDate = ''
  currentStep = 0;

  mouseHere = false;
  tooltipStep = 0;
  tooltipDate = '';
  tooltipPos = '0px';

  min = 0;
  max = 1;
  markDisabled: (d:any)=>boolean;
  styleElement: HTMLStyleElement;

  constructor(private el: ElementRef) {

    this.markDisabled = (d:any) => {
      return this.isDisabled(d);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.dates) {
      this.initSlider();
    }
  }

  initSlider() {
    this.min=0;
    if(!this.dates?.length){
      this.max=1;
      return;
    }
    this.oldStep = -1;
    this.max = this.dates.length-1;
    if(!this.userSet) {
      this.currentStep = this.max;
    } else if(this.currentStep > this.max) {
      this.currentStep = this.max;
      this.userSet = false;
    }

    this.firstDate = this.fromDate(this.dates[0]);
    this.lastDate = this.fromDate(this.dates[this.max]);
    this.stepChanged(false);
    this.createSliderStyles();
  }

  createSliderStyles(): void {
    let newElement = false;
    if(!this.styleElement){
      this.styleElement = document.createElement('style');
      newElement = true;
    } else {
      this.styleElement.firstChild?.remove();
    }

    const styleText = InterpolationService.interpolate(SLIDER_STYLE, {gradient: this.makeGradient()});
    this.styleElement.appendChild(document.createTextNode(styleText));

    if(newElement){
      this.el.nativeElement.appendChild(this.styleElement);
    }
  }

  makeGradient(): string {
    const years = this.dates.map((d=>d.getUTCFullYear()));
    const changeOfYearIndices = years.map((y,i)=>i?(years[i]===years[i-1]?-1:i):-1).filter(i=>i>=0);
    let changeOfYearPercentages = changeOfYearIndices.map(i=>+(100*i/this.dates.length).toFixed(2));

    changeOfYearPercentages = changeOfYearPercentages.filter((_,i)=>(i%TICK_FREQUENCY)==0)
    const gradient = changeOfYearPercentages.map(p=>{
      return `${BACKGROUND_COLOUR} ${(p-TICK_SIZE)}%,
      ${TICK_COLOUR} ${(p-TICK_SIZE)}%,
      ${TICK_COLOUR} ${(p+TICK_SIZE)}%,
      ${BACKGROUND_COLOUR} ${(p+TICK_SIZE)}%`;
    }).join(', \n');
    const style = `${GRADIENT}
      ${BACKGROUND_COLOUR},
      ${gradient},
      ${BACKGROUND_COLOUR} 100%);`;
    return style;
  }

  stepChanged(userSet: boolean) {
    this.userSet = this.userSet || userSet;

    if(this.currentStep===this.oldStep) {
      return;
    }

    this.date = this.dates[this.currentStep];
    this.currentDate = this.txtDate(this.date);
    this.dateChange.emit(this.date);
    this.ngbDate = this.fromDate(this.date);
    this.oldStep = this.currentStep;
  }

  txtDate(d:UTCDate):string{
    return d3.timeFormat(this.format)(d as Date);
  }

  fromDate(d:UTCDate):any {
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth()+1,
      day: d.getUTCDate()
    };
  }

  toDate(d:any):UTCDate{
    return new Date(Date.UTC(d.year, d.month-1, d.day));
  }

  isDisabled(d:any):boolean {
    if(!this.dates){
      return true;
    }
    for(let i=0;i<this.dates.length;i++){
      if(this.dates[i].getUTCFullYear()!==d.year){
        continue;
      }
      if(this.dates[i].getUTCMonth()!==(d.month-1)){
        continue;
      }
      if(this.dates[i].getUTCDate()!==d.day){
        continue;
      }
      return false;
    }
    return true;
  }

  ngbDateChanged(d:any) {
    const date = this.toDate(d);
    this.currentStep = this.dates.findIndex(d=>{
      return d.getUTCFullYear()===date.getUTCFullYear() &&
             d.getUTCMonth()===date.getUTCMonth() &&
             d.getUTCDate()===date.getUTCDate();
    });
    this.stepChanged(true);
  }

  mousemove(event:MouseEvent){
    this.mouseHere = true;
    const target = event.target as HTMLElement;
    this.tooltipStep = Math.round(this.dates.length * (event.offsetX)/ target.clientWidth);
    const date = this.txtDate(this.dates[this.tooltipStep]);
    setTimeout(()=>{
      this.tooltipDate = date;
      this.tooltipPos = event.offsetX +'px';
    });
  }

  mouseleave(): void {
    this.mouseHere = false;
    setTimeout(()=>{
      if(this.mouseHere){
        return;
      }
      this.tooltipStep = -1;
      this.tooltipDate = '';
      this.tooltipPos = '';
    }, MOUSE_LEAVE_DEBOUNCE);
  }

  selectTooltipDate(): void {
    this.currentStep = this.tooltipStep;
    this.stepChanged(true);
  }
}
