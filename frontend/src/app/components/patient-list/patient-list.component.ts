import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [MatTableModule, MatIconModule],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.css',
})
export class PatientListComponent implements OnInit {
  @Input() postedIdentifiers: Set<string> = new Set();
  @Output() patientSelected = new EventEmitter<string>();

  patients: Patient[] = [];
  displayedColumns = ['name', 'identifier', 'posted'];
  selectedIdentifier: string | null = null;
  errorMessage: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getPatients().subscribe({
      next: (res) => {
        if (res.success) {
          this.patients = res.data.patients;
        } else {
          this.errorMessage = res.error?.message ?? 'Failed to load patients';
        }
      },
      error: () => {
        this.errorMessage = 'Could not connect to the backend server';
      },
    });
  }

  selectPatient(identifier: string): void {
    this.selectedIdentifier = identifier;
    this.patientSelected.emit(identifier);
  }
}
