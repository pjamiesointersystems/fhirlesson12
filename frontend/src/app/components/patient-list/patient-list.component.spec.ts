import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PatientListComponent } from './patient-list.component';
import { ApiService } from '../../services/api.service';

describe('PatientListComponent', () => {
  let component: PatientListComponent;
  let fixture: ComponentFixture<PatientListComponent>;
  let mockApi: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    mockApi = jasmine.createSpyObj('ApiService', ['getPatients']);
    mockApi.getPatients.and.returnValue(
      of({ success: true, data: { patients: [{ name: 'Alice', identifier: '111-222-3333' }] } })
    );

    await TestBed.configureTestingModule({
      imports: [PatientListComponent],
      providers: [{ provide: ApiService, useValue: mockApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load patients on init', () => {
    expect(mockApi.getPatients).toHaveBeenCalledTimes(1);
    expect(component.patients.length).toBe(1);
    expect(component.patients[0].name).toBe('Alice');
  });

  it('should emit patientSelected on row click', () => {
    spyOn(component.patientSelected, 'emit');
    component.selectPatient('111-222-3333');
    expect(component.selectedIdentifier).toBe('111-222-3333');
    expect(component.patientSelected.emit).toHaveBeenCalledWith('111-222-3333');
  });
});
