import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ObservationPanelComponent } from './observation-panel.component';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';

describe('ObservationPanelComponent', () => {
  let component: ObservationPanelComponent;
  let fixture: ComponentFixture<ObservationPanelComponent>;
  let mockApi: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    mockApi = jasmine.createSpyObj('ApiService', ['generateFromFile', 'generateSynthetic']);

    await TestBed.configureTestingModule({
      imports: [ObservationPanelComponent],
      providers: [
        { provide: ApiService, useValue: mockApi },
        SessionService,
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ObservationPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show placeholder when no identifier', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Select a patient to generate observations');
  });

  it('should call generateFromFile on button click', () => {
    mockApi.generateFromFile.and.returnValue(
      of({ success: true, data: { count: 100, sample_observations: [{}, {}] }, message: 'ok' })
    );
    component.identifier = '111-222-3333';
    fixture.detectChanges();
    component.generateFromFile();
    expect(mockApi.generateFromFile).toHaveBeenCalled();
    expect(component.observationCount).toBe(100);
    expect(component.sampleObservations.length).toBe(2);
  });

  it('should clamp synthetic count', () => {
    mockApi.generateSynthetic.and.returnValue(
      of({ success: true, data: { count: 1000, sample_observations: [] }, message: 'ok' })
    );
    component.identifier = '111-222-3333';
    component.syntheticCount = 9999;
    fixture.detectChanges();
    component.generateSynthetic();
    expect(component.syntheticCount).toBe(1000);
  });
});
