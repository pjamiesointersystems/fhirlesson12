import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { PatientListComponent } from '../patient-list/patient-list.component';
import { PatientDetailComponent } from '../patient-detail/patient-detail.component';
import { ObservationPanelComponent } from '../observation-panel/observation-panel.component';
import { BundlePanelComponent } from '../bundle-panel/bundle-panel.component';
import { ResultsPanelComponent } from '../results-panel/results-panel.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, PatientListComponent, PatientDetailComponent, ObservationPanelComponent, BundlePanelComponent, ResultsPanelComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  selectedPatientIdentifier: string | null = null;
  observationCount: number | null = null;
  postResult: any = null;
  postError: any = null;
  postedIdentifiers = new Set<string>();

  onPatientSelected(identifier: string): void {
    this.selectedPatientIdentifier = identifier;
    this.observationCount = null;
    this.postResult = null;
    this.postError = null;
  }

  onPatientPosted(identifier: string): void {
    this.postedIdentifiers = new Set(this.postedIdentifiers).add(identifier);
  }

  onObservationCountChange(count: number): void {
    this.observationCount = count;
  }

  onBundlePosted(result: any): void {
    this.postResult = result;
    this.postError = null;
    if (result.bundle_type === 'transaction' && result.patient_id && this.selectedPatientIdentifier) {
      this.postedIdentifiers = new Set(this.postedIdentifiers).add(this.selectedPatientIdentifier);
    }
  }

  onPostFailed(error: any): void {
    this.postError = error;
    this.postResult = null;
  }
}
