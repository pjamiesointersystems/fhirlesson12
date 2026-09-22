import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PatientDetailComponent } from './patient-detail.component';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';

describe('PatientDetailComponent', () => {
  let component: PatientDetailComponent;
  let fixture: ComponentFixture<PatientDetailComponent>;
  let mockApi: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    mockApi = jasmine.createSpyObj('ApiService', ['getPatient', 'postPatient']);
    mockApi.getPatient.and.returnValue(
      of({
        success: true,
        data: {
          patient: { resourceType: 'Patient', name: [{ text: 'Test' }] },
          fhir_id: null,
        },
      })
    );

    await TestBed.configureTestingModule({
      imports: [PatientDetailComponent],
      providers: [
        { provide: ApiService, useValue: mockApi },
        SessionService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show placeholder when no identifier', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Select a patient to view details');
  });

  it('should load patient when identifier is set', () => {
    component.identifier = '111-222-3333';
    component.ngOnChanges({
      identifier: { currentValue: '111-222-3333', previousValue: null, firstChange: true, isFirstChange: () => true },
    });
    fixture.detectChanges();
    expect(mockApi.getPatient).toHaveBeenCalledWith('111-222-3333');
    expect(component.patientResource).toBeTruthy();
  });

  it('should show FHIR ID when present', () => {
    mockApi.getPatient.and.returnValue(
      of({ success: true, data: { patient: { resourceType: 'Patient' }, fhir_id: '742' } })
    );
    component.identifier = '111-222-3333';
    component.ngOnChanges({
      identifier: { currentValue: '111-222-3333', previousValue: null, firstChange: true, isFirstChange: () => true },
    });
    fixture.detectChanges();
    expect(component.fhirId).toBe('742');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('FHIR ID: 742');
  });
});
