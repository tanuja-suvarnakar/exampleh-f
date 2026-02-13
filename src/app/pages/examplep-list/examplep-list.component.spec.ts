import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamplepListComponent } from './examplep-list.component';

describe('ExamplepListComponent', () => {
  let component: ExamplepListComponent;
  let fixture: ComponentFixture<ExamplepListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExamplepListComponent]
    });
    fixture = TestBed.createComponent(ExamplepListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
