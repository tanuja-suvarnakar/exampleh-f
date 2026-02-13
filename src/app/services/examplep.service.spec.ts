import { TestBed } from '@angular/core/testing';

import { ExamplepService } from './examplep.service';

describe('ExamplepService', () => {
  let service: ExamplepService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExamplepService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
