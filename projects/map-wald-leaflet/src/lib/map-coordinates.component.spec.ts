import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapCoordinatesComponent } from './map-coordinates.component';

describe('MapCoordinatesComponent', () => {
  let component: MapCoordinatesComponent;
  let fixture: ComponentFixture<MapCoordinatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapCoordinatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapCoordinatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
