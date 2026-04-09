import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

type JasmineExpectation = {
  toBeTruthy: () => void;
};

declare const describe: (name: string, fn: () => void) => void;
declare const beforeEach: (fn: () => void | Promise<void>) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: (actual: unknown) => JasmineExpectation;

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
