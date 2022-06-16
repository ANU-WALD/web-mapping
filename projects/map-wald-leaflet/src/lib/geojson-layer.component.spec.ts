import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GeojsonLayerComponent } from './geojson-layer.component';

describe('GeojsonLayerComponent', () => {
  let component: GeojsonLayerComponent;
  let fixture: ComponentFixture<GeojsonLayerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GeojsonLayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeojsonLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
