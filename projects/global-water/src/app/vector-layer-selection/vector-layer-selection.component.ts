import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { VectorLayerDescriptor } from 'map-wald-leaflet';

@Component({
  selector: 'vector-layer-selection',
  templateUrl: './vector-layer-selection.component.html',
  styleUrls: ['./vector-layer-selection.component.scss']
})
export class VectorLayerSelectionComponent implements OnInit, OnChanges {
  @Input() vectorLayer: VectorLayerDescriptor = null;
  @Input() vectorLayers: VectorLayerDescriptor[] = [];
  @Input() currentZoom: number;
  @Input() enabled = true;
  @Output() vectorLayerSelected = new EventEmitter<VectorLayerDescriptor>();
  @Output() closeSelection = new EventEmitter<any>();

  selectedLayer: VectorLayerDescriptor;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.vectorLayers&&this.vectorLayers) {
      this.selectedLayer = this.vectorLayers[0];
    }
    if(changes.vectorLayer){
      this.selectedLayer = this.vectorLayers?.find(l=>l===this.vectorLayer);
    }
  }

  layerChanged(l: VectorLayerDescriptor): void {
    this.vectorLayerSelected.emit(this.selectedLayer);
  }

  closeButtonClicked(): void {
    this.closeSelection.emit(null);
  }
}

