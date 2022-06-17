import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoBlockComponent } from './logo-block.component';

describe('LogoBlockComponent', () => {
  let component: LogoBlockComponent;
  let fixture: ComponentFixture<LogoBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogoBlockComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogoBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
