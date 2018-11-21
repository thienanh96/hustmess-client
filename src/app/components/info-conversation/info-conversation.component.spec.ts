import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoConversationComponent } from './info-conversation.component';

describe('InfoConversationComponent', () => {
  let component: InfoConversationComponent;
  let fixture: ComponentFixture<InfoConversationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfoConversationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfoConversationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
