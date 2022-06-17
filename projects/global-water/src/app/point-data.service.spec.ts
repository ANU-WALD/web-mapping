import { TestBed } from '@angular/core/testing';

import { PointDataService } from './point-data.service';

describe('PointDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PointDataService = TestBed.get(PointDataService);
    expect(service).toBeTruthy();
  });
});
