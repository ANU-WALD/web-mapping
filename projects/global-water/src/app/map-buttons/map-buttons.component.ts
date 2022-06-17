import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { LeafletService, BasemapDescriptor, VectorLayerDescriptor,OneTimeSplashComponent } from 'map-wald-leaflet';
import { DisplaySettings } from '../data';

const OPACITY_STEP = 0.4;

@Component({
  selector: 'app-map-buttons',
  templateUrl: './map-buttons.component.html',
  styleUrls: ['./map-buttons.component.scss']
})
export class MapButtonsComponent implements OnInit, OnChanges {
  @Input() vectorLayers: VectorLayerDescriptor[];
  @Input() basemaps: BasemapDescriptor[];
  @Input() helpModal: OneTimeSplashComponent;
  @Output() optionsChanged = new EventEmitter<DisplaySettings>();
  @Input() minZoom = 5;
  @Input() maxZoom = 16;
  @Input() hintPlacement = 'left';

  private vp: any;

  currentZoom: number;
  transparency = 0;
  opacity = 1;
  showWindows = true;
  zoom = 9;
  mainLayer: any;
  basemapIdx = 0;
  baseLayer: BasemapDescriptor;

  constructor(private map: LeafletService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.basemaps&&this.basemaps&&!this.baseLayer){
      this.baseLayer = this.basemaps[0];
    }
  }

  ngOnInit(): void {
    this.withMap(m=>{
      this.zoom = m.getZoom();
      m.on('zoom',()=>{
        this.zoom = m.getZoom();
      });
    });
  }

  zoomIn(): void {
    this.withMap(m=>m.setZoom(m.getZoom()+1));
  }

  zoomOut(): void {
    this.withMap(m=>m.setZoom(m.getZoom()-1));
  }

  zoomToFit(): void {
    this.optionsChanged.emit({
      resetBounds: true
    });
  }

  toggleTransparency(): void {
    this.opacity -= OPACITY_STEP;
    if(this.opacity <= 0.0) {
      this.opacity = 1.0;
    }
    this.optionsChanged.emit({
      opacity:this.opacity
    });
    this.transparency = (1-this.opacity)*100;
  }

  transparencyChanged(): void {
    this.opacity = 1- (this.transparency/100);
    this.optionsChanged.emit({
      opacity:this.opacity
    });
  }

  toggleBaseLayer(): void {
    this.setBaseLayer((this.basemapIdx+1)%this.basemaps.length);
  }

  setBaseLayer(idx: number): void {
    this.basemapIdx = idx;
    this.baseLayer = this.basemaps[this.basemapIdx];

    this.optionsChanged.emit({
      basemap:this.baseLayer
    });
  }

  toggleButtons(): void {
    this.showWindows = !this.showWindows;
    this.optionsChanged.emit({
      showWindows: this.showWindows
    });
  }

  withMap(fn:((m:L.Map)=>void)): void {
    this.map.map.then(fn);
  }

  vectorLayerChanged(v: VectorLayerDescriptor): void {
    this.optionsChanged.emit({
      vectorLayer: v
    });
  }
}
