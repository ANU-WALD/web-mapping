import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ensurePane, LeafletService } from './leaflet.service';
import * as L from 'leaflet';

const DEFAULT_WMS_PARAMS = {
  format: 'image/png',
  transparent: true
};

@Component({
  selector: 'wms-layer',
  template: '',
  styles: []
})
export class WmsLayerComponent implements OnInit, OnChanges {
  @Input() url: string;
  @Input() params: any = {};
  @Input() zIndex = 10;
  private layer: L.TileLayer;

  constructor(private map: LeafletService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.map.map.then(m=>{
      if(this.layer){
        this.layer.removeFrom(m);
        this.layer = null;
      }
      if(!this.url||!this.params){
        return;
      }

      const params = Object.assign({},DEFAULT_WMS_PARAMS,this.params);

      const pane = `wms-pane-${this.zIndex}`;
      ensurePane(m,pane,this.zIndex)
      params.pane = pane;

      this.layer = L.tileLayer.wms(this.url,params as L.WMSOptions);
      // this.layer.options.noWrap = true;
      this.layer.addTo(m);
    });
  }

}
