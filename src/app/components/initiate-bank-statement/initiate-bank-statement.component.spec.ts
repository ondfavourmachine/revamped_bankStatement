import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiateBankStatementComponent } from './initiate-bank-statement.component';

describe('InitiateBankStatementComponent', () => {
  let component: InitiateBankStatementComponent;
  let fixture: ComponentFixture<InitiateBankStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitiateBankStatementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InitiateBankStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
