/// <reference types="./leaflet.customcontrols" />

import { Component, OnInit, ViewChild, Input, AfterViewInit, ElementRef } from '@angular/core';
import { LeafletService } from './leaflet.service';
import * as leaflet from 'leaflet';

interface SavedMapSettings {
  pan: boolean;
  zoom: boolean;
}

const TAG_WHITE_LIST = ['INPUT', 'SELECT', 'OPTION'];

interface MapWithHandler{
  _handlers: {
    enable: ()=>void;
    disable: ()=>void;
  }[];
}

@Component({
  selector: 'map-control',
  template: `<div #mapControl class="map-control-content"
                  (touchstart)="ontouchstart($event)"
                  (mouseenter)="disableMapEvents($event)"
                  (mouseleave)="enableMapEvents($event)"
                  (click)="m($event)"
                  (dblclick)="m($event)"
                  (mousemove)="m($event)"
                  (mousedown)="m($event)"
                  (mouseup)="m($event)">
  <ng-content></ng-content>
</div>
`, styles: [`.map-control-content{
  background: transparent;
}
`],
})
export class MapControlComponent implements OnInit, AfterViewInit {
  @ViewChild('mapControl', { static: false }) mapControl: Component;
  @Input() position = 'TOP_RIGHT';
  touchDevice = false;

  constructor(private _el: ElementRef, private _map: LeafletService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // this._wrapper.getNativeMap().then((m)=>{
    let content: HTMLElement = this._el.nativeElement.querySelector('.map-control-content');

    //   // If content of the map control is not already wrapped in a div, do it
    //   // now.
    if (content.nodeName !== "DIV") {
      const controlDiv: HTMLElement = document.createElement('div');
      controlDiv.appendChild(content);
      content = controlDiv;
    }

    const CustomControl = leaflet.Control.extend({
      onAdd: (map:leaflet.Map) => {
        return content;
      },

      onRemove: (map:leaflet.Map) => {
        // Nothing to do here
      }
    });

    const makeCustomControl = (opts:any) => {
      return new CustomControl(opts);
    };

    this._map.map.then(map => {
      const c = makeCustomControl({
        position: this.position.replace(/_/g,'').toLowerCase()
      });
      c.addTo(map);
    });
    //   (<any>m).controls[(<any>window).google.maps.ControlPosition[this.position]].push(content);
    // });
  }

  ontouchstart(ev: TouchEvent): void {
    this.touchDevice = true;
    if(TAG_WHITE_LIST.indexOf((ev.target as any).tagName)>=0){
      ev.stopPropagation();
    }
    this.enableMapEvents(null);
  }

  disableMapEvents(event:MouseEvent): void {
    this.m(event);

    if(this.touchDevice){
      return;
    }

    this._map.map.then(m=>{
      m.dragging.disable();
      m.scrollWheelZoom.disable();

      (m as any as MapWithHandler)._handlers.forEach(h=>h.disable());
    });
  }

  enableMapEvents(event:MouseEvent): void {
    if(event){
      this.m(event);
    }

    this._map.map.then(m=>{
      const options = {
        pan:true,
        zoom:true
      };

      if(options.pan){
        m.dragging.enable();
      }

      if(options.zoom){
        m.scrollWheelZoom.enable();
      }

      (m as any as MapWithHandler)._handlers.forEach(h=>h.enable());
    });
  }

  m(event:MouseEvent){
    event.stopPropagation();
  }

}
