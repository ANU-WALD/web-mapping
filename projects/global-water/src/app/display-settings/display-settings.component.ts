import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DisplaySettingsChange } from '../data';

@Component({
  selector: 'app-display-settings',
  templateUrl: './display-settings.component.html',
  styleUrls: ['./display-settings.component.scss']
})
export class DisplaySettingsComponent implements OnInit {
  @Input() opacity: number;
  @Output() displaySettingsChange = new EventEmitter<DisplaySettingsChange>();

  constructor() { }

  ngOnInit(): void {
  }

  settingControlChanged(event: DisplaySettingsChange) {
    this.displaySettingsChange.emit(event);
  }
}
