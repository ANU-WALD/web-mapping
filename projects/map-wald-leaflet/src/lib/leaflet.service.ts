import { Injectable } from '@angular/core';
import * as leaflet from 'leaflet';
import { Observable } from 'rxjs';

@Injectable()
export class LeafletService {
  map: Promise<leaflet.Map>;
  private resolve: ((x: leaflet.Map)=>void);
  private reject: ((x: any)=>void);

  constructor() {
    this.map = new Promise<leaflet.Map>((res,rej)=>{
      this.resolve = res;
      this.reject = rej;
    });
  }


  mapCreated(map: leaflet.Map): void {
    addControlPlaceholders(map);
    this.resolve(map);
  }

  withMap(fn:((m:L.Map)=>void)): void {
    this.map.then(fn);
  }
}

function addControlPlaceholders(map: any) {
  var corners = map._controlCorners,
      l = 'leaflet-',
      container = map._controlContainer;

  function createCorner(vSide:string, hSide:string) {
      var className = l + vSide + ' ' + l + hSide;

      corners[vSide + hSide] = leaflet.DomUtil.create('div', className, container);
  }

  createCorner('middle', 'left');
  createCorner('middle', 'right');
  createCorner('top', 'center');
  createCorner('bottom', 'center');
}

export function ensurePane(map:any, pane:string, zIndex:number): void {
  if (!map.getPane(pane)) {
    map.createPane(pane);
    map.getPane(pane).style.zIndex = 405 + zIndex;
  }
}