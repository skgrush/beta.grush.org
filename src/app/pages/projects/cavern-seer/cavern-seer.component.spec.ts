import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CavernSeerComponent } from './cavern-seer.component';

describe('CavernSeerComponent', () => {
  let component: CavernSeerComponent;
  let fixture: ComponentFixture<CavernSeerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CavernSeerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CavernSeerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
