import { Component, OnInit, OnChanges, SimpleChanges, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import * as leaflet from 'leaflet';
import { LeafletService } from './leaflet.service';
import { Bounds } from 'map-wald';
import { BasemapDescriptor } from './data';

const DEFAULT_BASE_MAP='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

@Component({
  selector: 'leaflet-map',
  template: `<div class="leafletHost" [style]="styles">
  <ng-content></ng-content>
</div>
`,styles: [
  `
  .leafletHost{
    width:100%;
    min-height:400px;
  }`
]
})
export class LeafletMapComponent implements OnInit, OnChanges {
  @Input() bounds: Bounds;
  @Input() maxBounds: Bounds;
  @Input() baseMap: BasemapDescriptor;
  @Input() zoomControl = true;
  @Input() minZoom = 5;
  @Input() maxZoom = 32;
  @Input() pointSelection = false;
  @Output() pointSelected = new EventEmitter<leaflet.LatLng>();

  map: leaflet.Map;
  styles: any = {};
  initialised = false;

  // Leaflet.TileLayer
  private baseLayer: leaflet.TileLayer;

  constructor(private element: ElementRef, private svc: LeafletService) {
    console.log('LeafletMapComponent');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.initialised){
      return;
    }

    const changeCount = Object.keys(changes).length;

    // if(this.creating){
    //   return;
    // }

    // if(this.map){
    //   if(changes.markers){
    //     this.setupMarkers();

    //     if(changeCount===1){
    //       return;
    //     }
    //   }
    //   this.map.remove();
    // }

//    if(!this.creating){
    this.updateMap(changes);
//    }

    if(changes.bounds){
      this.setBounds();
    }
  }

  ngOnInit(): void {
    this.updateMap();
    this.setBounds();
  }

  updateMap(changes?: SimpleChanges): void {
    setTimeout(()=>{
      if(!this.map){
        this.createMap();
        return;
      }

      if(changes&&changes.baseMap){
        // this.baseLayer.setUrl(this.baseMap.urlTemplate || DEFAULT_BASE_MAP)
        if(this.baseLayer){
          this.baseLayer.setUrl(this.baseMap.urlTemplate || DEFAULT_BASE_MAP);
          // this.baseLayer.removeFrom(this.map);
        } else if(this.baseMap) {
          this.createBaseLayer();
          this.baseLayer.addTo(this.map).bringToBack();
        }
      }
    });

    // Update parameters
  }

  createBaseLayer(): void {
    this.baseLayer = null;
    if(!this.baseMap){
      return;
    }

    const options: leaflet.TileLayerOptions = {};
    if(this.baseMap.maxNativeZoom){
      options.maxNativeZoom = this.baseMap.maxNativeZoom;
    }

    this.baseLayer = leaflet.tileLayer(this.baseMap.urlTemplate || DEFAULT_BASE_MAP,options);
  }

  createMap(): void {
    setTimeout(()=>{
      if(this.map){
        this.map.remove();
        this.map = null;
      }

      const theDiv = this.element.nativeElement as HTMLElement;
      const theHost = theDiv.querySelector('.leafletHost');

      // let baseLayers = R.mapObjIndexed(v=>{
      //   return L.tileLayer(v,
      //     { maxZoom: 18, attribution: '...' });
      // },this.baseMaps);

      // if(!this.baseMap || !baseLayers[this.baseMap]){
      //   this.baseMap = Object.keys(this.baseMaps)[0];
      // }

      // let baseLayerArray = [baseLayers[this.baseMap]];
      let crs = leaflet.CRS.EPSG3857;//:L.CRS.Simple;
      // if(this.crs){
      //   crs = L.CRS[this.crs];
      // }

      // let panes = 0;
      // if(this.map){
      //   panes = getCustomMapPanes(this.map).length;
      // }
      this.createBaseLayer();
      const baseLayerArray = [
      ];
      if(this.baseLayer){
        baseLayerArray.push(this.baseLayer);
      }

      this.map = leaflet.map(theHost as HTMLElement,{
        crs,
        zoom: 5,
        maxBounds: toBounds(this.maxBounds),
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        zoomControl: this.zoomControl,
        center: leaflet.latLng(-20, 135),
        // zoom: this.zoom,
        // minZoom: this.minZoom,
        // maxZoom: this.maxZoom,
        scrollWheelZoom: true,
        layers:baseLayerArray,
        continuousWorld: false,
        noWrap: true,
        tap: false,
        // worldCopyJump:true
            // attributionControl: this.attribution
      } as leaflet.MapOptions);
      this.svc.mapCreated(this.map);
      // if(!this.pannable){
      //   this.map.dragging.disable();
      // }

      // if(!this.zoomable){
      //   this.map.touchZoom.disable();
      //   this.map.doubleClickZoom.disable();
      //   this.map.scrollWheelZoom.disable();
      // }

      // configureVectorPanes(panes,this.map);

      // this._helper.register(this.map);
      this.map.on('click',(evt: leaflet.LeafletMouseEvent)=>{
        if(!this.pointSelection || evt.originalEvent.defaultPrevented){
          return;
        }

        this.pointSelected.emit(evt.latlng);
      });
      // this.creating=false;

      // this.map.on('zoomend',()=>this.coordinatesChanged());
      // this.map.on('moveend',()=>this.coordinatesChanged());

      // if(this.showLayerControl){
      //   this.layerControl = L.control.layers(baseLayers, [],{
      //     hideSingleBase:true
      //   }).addTo(this.map);
      // }

      // this.mapCreated.emit(this.map);



      // this.markerLayers = [];
      // this.setupMarkers();

      this.setBounds();
      this.initialised = true;
    });

  }

  setBounds(): void {
    if(!this.map||!this.bounds){
      return;
    }

    this.map.fitBounds(toBounds(this.bounds));
  }

}
/*
http://35.244.111.168:8080/wms
?service=WMS
&request=GetMap
&layers=wcf
&styles=
&format=image%2Fpng
&transparent=true
&version=1.1.1
&time=2019-01-01T00%3A00%3A00.000Z
&width=256
&height=256
&srs=EPSG%3A3857
&bbox=-17532819.79994059,-5009377.085697311,-15028131.257091936,-2504688.542848655

*/

function toBounds(bounds:Bounds):L.LatLngBoundsLiteral{
  if(!bounds){
    return null;
  }

  return [
    [bounds.south,bounds.west],
    [bounds.north,bounds.east]
  ];
}