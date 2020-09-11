import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeaheadInputComponent } from './typeahead-input.component';

describe('TypeaheadInputComponent', () => {
  let component: TypeaheadInputComponent;
  let fixture: ComponentFixture<TypeaheadInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TypeaheadInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeaheadInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
