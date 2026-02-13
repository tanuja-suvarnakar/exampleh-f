import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamplepFormComponent } from './examplep-form.component';

describe('ExamplepFormComponent', () => {
  let component: ExamplepFormComponent;
  let fixture: ComponentFixture<ExamplepFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExamplepFormComponent]
    });
    fixture = TestBed.createComponent(ExamplepFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
