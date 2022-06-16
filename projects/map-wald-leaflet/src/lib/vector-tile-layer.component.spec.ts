import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VectorTileLayerComponent } from './vector-tile-layer.component';

describe('VectorTileLayerComponent', () => {
  let component: VectorTileLayerComponent;
  let fixture: ComponentFixture<VectorTileLayerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VectorTileLayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VectorTileLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
