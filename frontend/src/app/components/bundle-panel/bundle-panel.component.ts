import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { JsonViewerComponent } from '../json-viewer/json-viewer.component';
import { ApiService } from '../../services/api.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-bundle-panel',
  standalone: true,
  imports: [TitleCasePipe, MatButtonModule, MatChipsModule, MatProgressSpinnerModule, JsonViewerComponent],
  templateUrl: './bundle-panel.component.html',
  styleUrl: './bundle-panel.component.css',
})
export class BundlePanelComponent {
  @Input() identifier: string | null = null;
  @Input() observationCount: number | null = null;
  @Output() bundlePosted = new EventEmitter<any>();
  @Output() postFailed = new EventEmitter<any>();

  bundleType: string | null = null;
  bundleTypeReason: string | null = null;
  entryCount: number | null = null;
  bundleJson: any = null;
  errorMessage: string | null = null;
  loading = false;
  posting = false;

  constructor(
    private api: ApiService,
    private session: SessionService
  ) {}

  get canBuild(): boolean {
    return !!this.identifier && (this.observationCount ?? 0) > 0 && !this.loading && !this.posting;
  }

  get canPost(): boolean {
    return this.bundleJson != null && !this.posting && !this.loading;
  }

  buildBundle(): void {
    if (!this.identifier || this.loading) return;
    this.loading = true;
    this.errorMessage = null;

    this.api.buildBundle(this.session.getSessionId(), this.identifier).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.bundleType = res.data.bundle_type;
          this.bundleTypeReason = res.data.bundle_type_reason;
          this.entryCount = res.data.entry_count;
          this.bundleJson = res.data.bundle_json;
        } else {
          this.errorMessage = res.error?.message ?? 'Failed to build bundle';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Could not connect to the backend server';
      },
    });
  }

  postBundle(): void {
    if (!this.identifier || this.posting) return;
    this.posting = true;
    this.errorMessage = null;

    this.api.postBundle(this.session.getSessionId(), this.identifier).subscribe({
      next: (res) => {
        this.posting = false;
        if (res.success) {
          this.bundlePosted.emit(res.data);
        } else {
          this.errorMessage = res.error?.message ?? 'Failed to post bundle';
          this.postFailed.emit(res.error);
        }
      },
      error: () => {
        this.posting = false;
        this.errorMessage = 'Could not connect to the backend server';
        this.postFailed.emit({ code: 'NETWORK_ERROR', message: 'Could not connect to the backend server' });
      },
    });
  }
}
