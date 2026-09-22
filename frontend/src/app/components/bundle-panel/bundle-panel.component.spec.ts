import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { BundlePanelComponent } from './bundle-panel.component';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';

describe('BundlePanelComponent', () => {
  let component: BundlePanelComponent;
  let fixture: ComponentFixture<BundlePanelComponent>;
  let mockApi: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    mockApi = jasmine.createSpyObj('ApiService', ['buildBundle', 'postBundle']);

    await TestBed.configureTestingModule({
      imports: [BundlePanelComponent],
      providers: [
        { provide: ApiService, useValue: mockApi },
        SessionService,
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BundlePanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show placeholder when no identifier', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Select a patient to build a bundle');
  });

  it('should disable build when no observations', () => {
    component.identifier = '111-222-3333';
    component.observationCount = 0;
    fixture.detectChanges();
    expect(component.canBuild).toBeFalse();
  });

  it('should call buildBundle and populate results', () => {
    mockApi.buildBundle.and.returnValue(
      of({
        success: true,
        data: {
          bundle_type: 'batch',
          bundle_type_reason: 'Patient has known FHIR server ID',
          entry_count: 5,
          bundle_json: { resourceType: 'Bundle' },
        },
        message: 'ok',
      })
    );
    component.identifier = '111-222-3333';
    component.observationCount = 10;
    fixture.detectChanges();
    component.buildBundle();
    expect(mockApi.buildBundle).toHaveBeenCalled();
    expect(component.bundleType).toBe('batch');
    expect(component.entryCount).toBe(5);
  });

  it('should not allow post when no bundle built', () => {
    component.identifier = '111-222-3333';
    component.bundleJson = null;
    expect(component.canPost).toBeFalse();
  });

  it('should allow post when bundle is built', () => {
    component.identifier = '111-222-3333';
    component.bundleJson = { resourceType: 'Bundle' };
    expect(component.canPost).toBeTrue();
  });

  it('should call postBundle and emit result on success', () => {
    const postResult = {
      patient_id: '742',
      observation_ids: ['743', '744'],
      bundle_type: 'transaction',
      server_response: {},
    };
    mockApi.postBundle.and.returnValue(
      of({ success: true, data: postResult, message: 'ok' })
    );
    spyOn(component.bundlePosted, 'emit');
    component.identifier = '111-222-3333';
    component.bundleJson = { resourceType: 'Bundle' };
    fixture.detectChanges();
    component.postBundle();
    expect(mockApi.postBundle).toHaveBeenCalled();
    expect(component.posting).toBeFalse();
    expect(component.bundlePosted.emit).toHaveBeenCalledWith(postResult);
  });

  it('should display error on post failure', () => {
    mockApi.postBundle.and.returnValue(
      of({
        success: false,
        error: { code: 'FHIR_SERVER_UNREACHABLE', message: 'Could not connect to FHIR server' },
      })
    );
    component.identifier = '111-222-3333';
    component.bundleJson = { resourceType: 'Bundle' };
    fixture.detectChanges();
    component.postBundle();
    expect(component.posting).toBeFalse();
    expect(component.errorMessage).toContain('Could not connect to FHIR server');
  });

  it('should handle network error on post', () => {
    mockApi.postBundle.and.returnValue(throwError(() => new Error('Network error')));
    component.identifier = '111-222-3333';
    component.bundleJson = { resourceType: 'Bundle' };
    fixture.detectChanges();
    component.postBundle();
    expect(component.posting).toBeFalse();
    expect(component.errorMessage).toBe('Could not connect to the backend server');
  });

  it('should prevent double-click during posting', () => {
    mockApi.postBundle.and.returnValue(
      of({ success: true, data: {}, message: 'ok' })
    );
    component.identifier = '111-222-3333';
    component.bundleJson = { resourceType: 'Bundle' };
    component.posting = true;
    component.postBundle();
    expect(mockApi.postBundle).not.toHaveBeenCalled();
  });
});
