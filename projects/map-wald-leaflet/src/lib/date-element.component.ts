import { Component, Input, ViewChild, AfterViewInit, ElementRef, Output, EventEmitter } from '@angular/core';


declare var Plotly: any;

@Component({
  selector: 'date-element',
  template: `<div class="row no-gutters">
  <div class="col-4">{{label}}</div>
  <div class="col-2">
    <button class="btn btn-secondary btn-sm"
            (click)="move(-step)"
            [disabled]="disabled">
      <i class="fa fa-angle-left"></i>
    </button>
  </div>
  <div class="col-4"><button class="btn btn-link btn-sm">{{src[property]}}</button></div>
  <div class="col-2">
    <button class="btn btn-secondary btn-sm"
            (click)="move(step)"
            [disabled]="disabled">
      <i class="fa fa-angle-right"></i>
    </button>
  </div>
</div>
`,styles: []})
export class DateElementComponent implements AfterViewInit  {
  @Input() label:string;
  @Input() property:string;
  @Input() src:any;
  @Input() step = 1;
  @Output() changed = new EventEmitter<any>();
  @Input() disabled = false;

  constructor(){

  }

  ngAfterViewInit(){

  }

  move(n:number){
    this.src[this.property] += n;
    this.changed.emit(this.src);
  }
}
