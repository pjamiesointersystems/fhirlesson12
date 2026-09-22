import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsPanelComponent } from './results-panel.component';

describe('ResultsPanelComponent', () => {
  let component: ResultsPanelComponent;
  let fixture: ComponentFixture<ResultsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show placeholder when no result', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Post a bundle to see results here');
  });

  it('should display Patient ID on success', () => {
    component.postResult = {
      patient_id: '742',
      observation_ids: ['743', '744'],
      bundle_type: 'transaction',
      server_response: { resourceType: 'Bundle' },
    };
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('742');
    expect(el.textContent).toContain('Patient FHIR ID');
  });

  it('should display observation IDs and count', () => {
    component.postResult = {
      patient_id: '742',
      observation_ids: ['743', '744', '745'],
      bundle_type: 'batch',
      server_response: {},
    };
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('3 Observations Created');
    expect(el.textContent).toContain('743');
    expect(el.textContent).toContain('744');
    expect(el.textContent).toContain('745');
  });

  it('should handle null patient_id for batch bundles', () => {
    component.postResult = {
      patient_id: null,
      observation_ids: ['1'],
      bundle_type: 'batch',
      server_response: {},
    };
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('N/A (batch bundle)');
  });

  it('should display error code and message', () => {
    component.errorResult = {
      code: 'FHIR_SERVER_UNREACHABLE',
      message: 'Could not connect to FHIR server',
    };
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('FHIR_SERVER_UNREACHABLE');
    expect(el.textContent).toContain('Could not connect to FHIR server');
  });

  it('should display error details when present', () => {
    component.errorResult = {
      code: 'FHIR_SERVER_ERROR',
      message: 'Server error',
      details: 'Connection refused',
    };
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Connection refused');
  });

  it('should not show details section when details absent', () => {
    component.errorResult = {
      code: 'NO_BUNDLE',
      message: 'No bundle found',
    };
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Connection refused');
  });
});
