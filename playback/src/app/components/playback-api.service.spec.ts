import { TestBed } from '@angular/core/testing';

import { PlaybackApiService } from './playback-api.service';

describe('PlaybackApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlaybackApiService = TestBed.get(PlaybackApiService);
    expect(service).toBeTruthy();
  });
});
