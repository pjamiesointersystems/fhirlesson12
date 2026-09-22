import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientDetailComponent } from './components/patient-detail/patient-detail.component';
import { ObservationPanelComponent } from './components/observation-panel/observation-panel.component';
import { BundlePanelComponent } from './components/bundle-panel/bundle-panel.component';
import { ResultsPanelComponent } from './components/results-panel/results-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatToolbarModule, MatCardModule, PatientListComponent, PatientDetailComponent, ObservationPanelComponent, BundlePanelComponent, ResultsPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  selectedPatientIdentifier: string | null = null;
  observationCount: number | null = null;
  postResult: any = null;
  postError: any = null;

  onPatientSelected(identifier: string): void {
    this.selectedPatientIdentifier = identifier;
    this.observationCount = null;
    this.postResult = null;
    this.postError = null;
  }

  onObservationCountChange(count: number): void {
    this.observationCount = count;
  }

  onBundlePosted(result: any): void {
    this.postResult = result;
    this.postError = null;
  }

  onPostFailed(error: any): void {
    this.postError = error;
    this.postResult = null;
  }
}
