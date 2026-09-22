import { Component, Input } from '@angular/core';
import { JsonViewerComponent } from '../json-viewer/json-viewer.component';

@Component({
  selector: 'app-results-panel',
  standalone: true,
  imports: [JsonViewerComponent],
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.css',
})
export class ResultsPanelComponent {
  @Input() postResult: any = null;
  @Input() errorResult: any = null;

  get hasResult(): boolean {
    return this.postResult != null || this.errorResult != null;
  }

  get patientId(): string | null {
    return this.postResult?.patient_id ?? null;
  }

  get observationIds(): string[] {
    return this.postResult?.observation_ids ?? [];
  }

  get serverResponse(): any {
    return this.postResult?.server_response ?? null;
  }

  get bundleType(): string | null {
    return this.postResult?.bundle_type ?? null;
  }
}
