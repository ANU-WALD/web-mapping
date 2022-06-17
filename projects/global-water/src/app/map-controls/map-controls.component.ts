import { Component, OnInit, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DisplaySettingsChange, LayerDescriptor, MapSettings } from '../data';
import { LayersService } from '../layers.service';

const MIN_YEAR=1990;

@Component({
  selector: 'app-map-controls',
  templateUrl: './map-controls.component.html',
  styleUrls: ['./map-controls.component.scss']
})
export class MapControlsComponent implements OnInit, OnChanges {
  @Input() orientation: 'vertical' | 'horizontal' = 'horizontal';
  @Input() layers: LayerDescriptor[];
  @Input() settings: MapSettings;

  @Output() optionsChanged = new EventEmitter<MapSettings>();
  @Output() settingChanged = new EventEmitter<DisplaySettingsChange>();

  constructor(private layersService: LayersService) {
    // this.years = (new Array(31)).fill(0).map((_,ix) => MIN_YEAR+ix);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.layers&&!this.settings.layer){
      this.settings.layer = this.layers[0];
    }

    if(this.settings.layer&&this.settings.date){
      this.constrainDate();
    }
  }

  ngOnInit(): void {
  }

  formControlChanged(): void {
    this.optionsChanged.emit(this.settings);
  }

  layerChanged(): void {
    this.constrainDate();
    this.formControlChanged();
  }

  // relativeSwitchChanged(): void {
  //   if(this.settings.relative){
  //     const options = Object.keys(this.settings.layer.relativeOptions||{});
  //     if(!this.settings.relativeVariable||!options.includes(this.settings.relativeVariable)){
  //       this.settings.relativeVariable = options[0];
  //     }
  //   }
  //   this.formControlChanged();
  // }

  // relativeModeChanged(): void {
  //   this.settings.relative = true;
  //   this.formControlChanged();
  // }

  constrainDate(): void {
    this.settings.date = this.layersService.constrainDate(this.settings.date,this.settings.layer);
  }

  dateChanged(date: Date): void {
    this.settings.date = date;
    this.constrainDate();
    this.formControlChanged();
  }

  settingControlChanged(event: DisplaySettingsChange) {
    this.settingChanged.emit(event);
  }
}

