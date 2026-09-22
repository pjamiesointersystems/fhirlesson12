import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { JsonViewerComponent } from '../json-viewer/json-viewer.component';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [MatButtonModule, JsonViewerComponent],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.css',
})
export class PatientDetailComponent implements OnChanges {
  @Input() identifier: string | null = null;

  patientResource: any = null;
  fhirId: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  posting = false;

  constructor(
    private api: ApiService,
    private session: SessionService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['identifier'] && this.identifier) {
      this.loadPatient(this.identifier);
    }
  }

  loadPatient(identifier: string): void {
    this.successMessage = null;
    this.errorMessage = null;

    this.api.getPatient(identifier).subscribe({
      next: (res) => {
        if (res.success) {
          this.patientResource = res.data.patient;
          this.fhirId = res.data.fhir_id ?? null;
        } else {
          this.patientResource = null;
          this.errorMessage = res.error?.message ?? 'Failed to load patient';
        }
      },
      error: () => {
        this.patientResource = null;
        this.errorMessage = 'Could not connect to the backend server';
      },
    });
  }

  postPatient(): void {
    if (!this.identifier || this.posting) return;
    this.posting = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.api.postPatient(this.identifier, this.session.getSessionId()).subscribe({
      next: (res) => {
        this.posting = false;
        if (res.success) {
          this.fhirId = res.data.fhir_id;
          this.successMessage = res.message ?? 'Patient posted successfully';
        } else {
          this.errorMessage = res.error?.message ?? 'Failed to post patient';
        }
      },
      error: () => {
        this.posting = false;
        this.errorMessage = 'Could not connect to the backend server';
      },
    });
  }
}
