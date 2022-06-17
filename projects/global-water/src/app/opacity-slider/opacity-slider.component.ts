import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DisplaySettingsChange } from '../data';

@Component({
  selector: 'app-opacity-slider',
  templateUrl: './opacity-slider.component.html',
  styleUrls: ['./opacity-slider.component.scss']
})
export class OpacitySliderComponent implements OnInit {
  @Output() opacityChange = new EventEmitter<DisplaySettingsChange>();
  @Input() opacity = 100;

  constructor() { }

  ngOnInit(): void {
  }

  formControlChanged() {
    this.opacityChange.emit({
      setting: 'opacity',
      value: this.opacity
    });
  }
}

