import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RootRedirectComponent } from './root-redirect.component';

describe('RootRedirectComponent', () => {
  let component: RootRedirectComponent;
  let fixture: ComponentFixture<RootRedirectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RootRedirectComponent]
    });
    fixture = TestBed.createComponent(RootRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
