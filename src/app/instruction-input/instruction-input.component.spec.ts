import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructionInputComponent } from './instruction-input.component';

describe('InstructionInputComponent', () => {
  let component: InstructionInputComponent;
  let fixture: ComponentFixture<InstructionInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstructionInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructionInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
