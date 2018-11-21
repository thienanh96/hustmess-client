import { TestBed } from '@angular/core/testing';

import { RoomchatUserService } from './roomchat-user.service';

describe('RoomchatUserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RoomchatUserService = TestBed.get(RoomchatUserService);
    expect(service).toBeTruthy();
  });
});
