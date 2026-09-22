import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { JsonViewerComponent } from '../json-viewer/json-viewer.component';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-observation-panel',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    JsonViewerComponent,
  ],
  templateUrl: './observation-panel.component.html',
  styleUrl: './observation-panel.component.css',
})
export class ObservationPanelComponent {
  @Input() identifier: string | null = null;
  @Output() observationCountChange = new EventEmitter<number>();

  syntheticCount = 50;
  observationCount: number | null = null;
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

  generateSynthetic(): void {
    if (!this.identifier || this.loading) return;
    this.loading = true;
    this.errorMessage = null;

    const count = Math.max(1, Math.min(this.syntheticCount || 1, 1000));
    this.syntheticCount = count;

    this.api.generateSynthetic(this.session.getSessionId(), this.identifier, count).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.observationCount = res.data.count;
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
