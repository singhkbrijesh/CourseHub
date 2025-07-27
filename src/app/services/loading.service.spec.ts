import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';
import { take } from 'rxjs';

fdescribe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoadingService]
    });
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show loading', () => {
    service.show();
    expect(service.isLoading()).toBeTrue();
  });

  it('should hide loading', () => {
    service.show();
    service.hide();
    expect(service.isLoading()).toBeFalse();
  });

  it('should not go below zero loading count', () => {
    service.hide();
    expect(service.isLoading()).toBeFalse();
    service.hide();
    expect(service.isLoading()).toBeFalse();
  });

  it('should force hide all loading states', () => {
    service.show();
    service.show();
    service.hideAll();
    expect(service.isLoading()).toBeFalse();
  });

  it('should emit loading$ observable', (done) => {
  service.show();
  service.loading$.pipe(take(1)).subscribe(val => {
    expect(typeof val).toBe('boolean');
    done();
  });
});
});