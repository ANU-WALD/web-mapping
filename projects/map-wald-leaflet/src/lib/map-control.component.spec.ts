import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MapControlComponent } from './map-control.component';

describe('MapControlComponent', () => {
  let component: MapControlComponent;
  let fixture: ComponentFixture<MapControlComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
