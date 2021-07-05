import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAccountDetailsComponent } from './add-account-details.component';

describe('AddAccountDetailsComponent', () => {
  let component: AddAccountDetailsComponent;
  let fixture: ComponentFixture<AddAccountDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAccountDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAccountDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
