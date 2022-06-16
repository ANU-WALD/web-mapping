import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WmsLayerComponent } from './wms-layer.component';

describe('WmsLayerComponent', () => {
  let component: WmsLayerComponent;
  let fixture: ComponentFixture<WmsLayerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WmsLayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WmsLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
