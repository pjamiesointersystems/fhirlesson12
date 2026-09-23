import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { JsonViewerComponent } from '../json-viewer/json-viewer.component';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-observation-panel',
  standalone: true,
  imports: [
    MatButtonModule,
    JsonViewerComponent,
  ],
  templateUrl: './observation-panel.component.html',
  styleUrl: './observation-panel.component.css',
})
export class ObservationPanelComponent {
  @Input() identifier: string | null = null;
  @Output() observationCountChange = new EventEmitter<number>();

  observationCount: number | null = null;
  sampleRaw: any[] = [];
  sampleObservations: any[] = [];
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private api: ApiService,
    private session: SessionService
  ) {}

  generateFromFile(): void {
    if (!this.identifier || this.loading) return;
    this.loading = true;
    this.errorMessage = null;

    this.api.generateFromFile(this.session.getSessionId(), this.identifier).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.observationCount = res.data.count;
          this.sampleRaw = res.data.sample_raw ?? [];
          this.sampleObservations = res.data.sample_observations;
          this.observationCountChange.emit(this.observationCount!);
        } else {
          this.errorMessage = res.error?.message ?? 'Failed to generate observations';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Could not connect to the backend server';
      },
    });
  }
}
