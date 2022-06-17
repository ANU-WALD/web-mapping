import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiYearTimeseriesChartComponent } from './multi-year-timeseries-chart.component';

describe('MultiYearTimeseriesChartComponent', () => {
  let component: MultiYearTimeseriesChartComponent;
  let fixture: ComponentFixture<MultiYearTimeseriesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiYearTimeseriesChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiYearTimeseriesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
