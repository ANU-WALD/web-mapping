import { Component, OnInit } from '@angular/core';
import { LatLng, LatLngBounds, LeafletEvent, LeafletMouseEvent } from 'leaflet';
import { LeafletService } from './leaflet.service';

@Component({
  selector: 'map-coordinates',
  template: `
  <div style="background-color:white">
    <p>Cursor: {{mouseCoordinates}}</p>
    <p>Bounds: {{bounds | json}}</p>
</div>
`,
  styles: []
})
export class MapCoordinatesComponent implements OnInit {
  mouseCoordinates: LatLng;
  bounds: LatLngBounds;

  constructor(private map: LeafletService) {
    this.withMap(m=>{
      const events = [
        'resize',
        'zoomend',
        'moveend',
        'mousemove'
      ]
      events.forEach(e=>{
        m.on(e,(evt)=>this.mapChange(evt));
      });

      // const mouseEvents = [
      //   'mousemove'
      // ];
      // mouseEvents.forEach(e=>{
      //   m.on(e,(evt)=>this.mouseEvent(evt));
      // })
    });
  }

  ngOnInit(): void {
  }

  withMap(fn:((m:L.Map)=>void)): void {
    this.map.map.then(fn);
  }

  mapChange(evt:LeafletEvent): void {
    if(evt.type==='mousemove'){
      this.mouseCoordinates = (evt as LeafletMouseEvent).latlng;
      return;
    }

    const map:L.Map = evt.target;
    this.bounds = map.getBounds();
    // console.log(evt);
  }

  // mouseEvent(evt:MouseEvent):void {

  // }
}
