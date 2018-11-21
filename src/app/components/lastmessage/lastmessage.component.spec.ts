import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LastmessageComponent } from './lastmessage.component';

describe('LastmessageComponent', () => {
  let component: LastmessageComponent;
  let fixture: ComponentFixture<LastmessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LastmessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LastmessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
