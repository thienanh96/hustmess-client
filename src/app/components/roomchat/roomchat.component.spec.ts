import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomchatComponent } from './roomchat.component';

describe('RoomchatComponent', () => {
  let component: RoomchatComponent;
  let fixture: ComponentFixture<RoomchatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomchatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomchatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
