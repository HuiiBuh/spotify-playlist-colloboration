import { TestBed } from '@angular/core/testing';

import { QueueApiService } from './queue-api.service';

describe('QueueApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: QueueApiService = TestBed.get(QueueApiService);
    expect(service).toBeTruthy();
  });
});
