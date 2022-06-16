import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OneTimeSplashComponent } from './one-time-splash.component';

describe('OneTimeSplashComponent', () => {
  let component: OneTimeSplashComponent;
  let fixture: ComponentFixture<OneTimeSplashComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OneTimeSplashComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneTimeSplashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
