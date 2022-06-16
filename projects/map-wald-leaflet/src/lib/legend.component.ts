import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'legend',
  template: `<div class="map-legend panel panel-group">
<ng-template #tooltipContent>
  <span [innerHtml]=helpText></span>
</ng-template>
  <strong>{{title}} <span *ngIf="mapUnits" [innerHTML]="'('+mapUnits+')'"></span>
        <span *ngIf="helpText"
              [ngbTooltip]="tooltipContent"
              [placement]="tooltipPlacement"
              container="body">
          <i class="fa fa-info-circle"></i>
        </span>
  </strong>

  <div *ngIf="!imageURL">
    <div style="display:table;line-height:15px">
      <div style="display:table-row;padding:0;"
          *ngFor="let colour of colours; let i=index">
        <div class="legend-colour" [ngClass]="markerClasses[i]||markerClasses[0]||''">
          <i class="legend-entry" [ngStyle]="{background:colour}"></i>
        </div>
        <div class="legend-label">
          <span [innerHTML]="labels[i]"></span>
        </div>
      </div>
    </div>
  </div>

  <div *ngIf="imageURL">
    <img [src]="imageURL">
  </div>
  <p *ngIf="attributionLink">Source: <a [href]="attributionLink">{{attribution || 'details'}}</a></p>
  <p *ngIf="attribution&&!attributionLink">Source: {{attribution}}</p>
</div>
`, styles: [`
.map-legend{
  display:block;
  background: white;
}

.legend-colour{
  display:table-cell;
  padding:0px;
}

.legend-label{
  display:table-cell;
  padding:0px 4px 2px 2px;
  font-size:10px;
  vertical-align:middle;
}

.legend-entry {
  float: left;
  width: 15px !important;
  height: 15px !important;
}

.legend-colour.circle i.legend-entry {
  border-radius:7px;
}
`]
})
export class LegendComponent implements OnInit {
  @Input() colours: Array<string> = ['red', 'white', 'blue'];
  @Input() labels: Array<string> = [];
  @Input() markerClasses: string[] = [];
  @Input() imageURL: string
  @Input() title = 'the title';
  @Input() mapUnits = '';
  @Input() helpText: string;
  @Input() tooltipPlacement = 'right';
  @Input() attribution: string;
  @Input() attributionLink: string;

  generatedLabels: string[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}

export function makeColour(r: number, g: number, b: number, a?: number): string {
  a = (a === undefined) ? 1 : a;
  return `rgb(${r},${g},${b},${a})`;
}

