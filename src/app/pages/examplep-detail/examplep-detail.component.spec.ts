import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamplepDetailComponent } from './examplep-detail.component';

describe('ExamplepDetailComponent', () => {
  let component: ExamplepDetailComponent;
  let fixture: ComponentFixture<ExamplepDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExamplepDetailComponent]
    });
    fixture = TestBed.createComponent(ExamplepDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
