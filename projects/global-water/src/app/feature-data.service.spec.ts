import { TestBed } from '@angular/core/testing';

import { FeatureDataService } from './feature-data.service';

describe('FeatureDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FeatureDataService = TestBed.get(FeatureDataService);
    expect(service).toBeTruthy();
  });
});
