import { TestBed } from '@angular/core/testing';

import { RoomchatService } from './roomchat.service';

describe('RoomchatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RoomchatService = TestBed.get(RoomchatService);
    expect(service).toBeTruthy();
  });
});
