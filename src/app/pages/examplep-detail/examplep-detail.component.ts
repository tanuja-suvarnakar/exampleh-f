// src/app/pages/examplep-detail/examplep-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamplepService, Examplep } from '../../services/examplep.service';
import {
  PrescriptionsService,
  Prescription,
  CreatePrescriptionPayload
} from '../../services/prescriptions.service';
import { AuthService } from '../../core/auth.service';

interface ExamplepStats {
  totalPrescriptions: number;
  thisMonth: number;
  lastVisit: Date | null;
}

@Component({
  selector: 'app-examplep-detail',
  templateUrl: './examplep-detail.component.html',
  styleUrls: ['./examplep-detail.component.scss']
})
export class ExamplepDetailComponent implements OnInit {
  examplep?: Examplep;
  loading = true;
  error = '';

  prescriptions: Prescription[] = [];
  loadingPrescriptions = true;
  prescriptionsError = '';

  // Stats
  stats: ExamplepStats = {
    totalPrescriptions: 0,
    thisMonth: 0,
    lastVisit: null
  };

  // Month navigation
  currentMonthDate: Date = new Date();
  private monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // New prescription form
  currentUser: any;
  showAddForm = false;
  newMedication = '';
  newDosage = '';
  newInstructions = '';
  creatingPrescription = false;
  createError = '';
  createSuccess = false;

  // Active tab
  activeTab: 'prescriptions' | 'history' | 'notes' = 'prescriptions';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examplepService: ExamplepService,
    private prescriptionsService: PrescriptionsService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Invalid examplep id';
      this.loading = false;
      return;
    }

    this.loadExamplep(id);
    this.loadPrescriptions(id);
  }

  loadExamplep(id: number): void {
    this.examplepService.getById(id).subscribe({
      next: (data: Examplep) => {
        this.examplep = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load examplep';
        this.loading = false;
      }
    });
  }

  loadPrescriptions(examplepId: number): void {
    this.prescriptionsService.getAllForExamplep(examplepId).subscribe({
      next: (data: Prescription[]) => {
        this.prescriptions = data;
        this.updateStats();
        this.loadingPrescriptions = false;
      },
      error: (err: any) => {
        this.prescriptionsError =
          err.error?.message || 'Failed to load prescriptions';
        this.loadingPrescriptions = false;
      }
    });
  }

  private updateStats(): void {
    this.stats.totalPrescriptions = this.prescriptions.length;
    
    const now = new Date();
    this.stats.thisMonth = this.prescriptions.filter((p: Prescription) => {
      if (!p.issuedAt) return false;
      const issued = new Date(p.issuedAt);
      return issued.getMonth() === now.getMonth() && 
             issued.getFullYear() === now.getFullYear();
    }).length;

    // Find last prescription date
    if (this.prescriptions.length > 0) {
      const sorted = [...this.prescriptions]
        .filter((p: Prescription) => p.issuedAt)
        .sort((a: Prescription, b: Prescription) => 
          new Date(b.issuedAt!).getTime() - new Date(a.issuedAt!).getTime()
        );
      
      if (sorted.length > 0 && sorted[0].issuedAt) {
        this.stats.lastVisit = new Date(sorted[0].issuedAt);
      }
    }
  }

  // Month label
  get currentMonthLabel(): string {
    const m = this.monthNames[this.currentMonthDate.getMonth()];
    const y = this.currentMonthDate.getFullYear();
    return `${m} ${y}`;
  }

  get currentMonthShort(): string {
    const m = this.monthNames[this.currentMonthDate.getMonth()].substring(0, 3);
    const y = this.currentMonthDate.getFullYear();
    return `${m} ${y}`;
  }

  changeMonth(offset: number): void {
    const d = new Date(this.currentMonthDate);
    d.setMonth(d.getMonth() + offset);
    this.currentMonthDate = d;
  }

  goToCurrentMonth(): void {
    this.currentMonthDate = new Date();
  }

  // Filter by selected month
  get filteredPrescriptions(): Prescription[] {
    if (!this.prescriptions || this.prescriptions.length === 0) {
      return [];
    }
    return this.prescriptions.filter((p: Prescription) => {
      if (!p.issuedAt) return false;
      const issued = new Date(p.issuedAt);
      return (
        issued.getFullYear() === this.currentMonthDate.getFullYear() &&
        issued.getMonth() === this.currentMonthDate.getMonth()
      );
    });
  }

  downloadPrescription(p: Prescription): void {
    this.prescriptionsService.downloadPrescription(p.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prescription-${p.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Download failed:', err);
      }
    });
  }

  // Only allow exampled or admin to add prescriptions
  get canAddPrescription(): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === 'EXAMPLED' || this.currentUser.role === 'ADMIN';
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newMedication = '';
    this.newDosage = '';
    this.newInstructions = '';
    this.createError = '';
    this.createSuccess = false;
  }

  createPrescription(): void {
    if (!this.examplep || !this.examplep.id) return;
    if (!this.currentUser) return;

    if (!this.newMedication || !this.newDosage || !this.newInstructions) {
      this.createError = 'Please fill in all fields.';
      return;
    }

    this.createError = '';
    this.createSuccess = false;
    this.creatingPrescription = true;

    const payload: CreatePrescriptionPayload = {
      examplepId: this.examplep.id,
      exampledId: this.currentUser.id,
      medication: this.newMedication,
      dosage: this.newDosage,
      instructions: this.newInstructions
    };

    this.prescriptionsService.createPrescription(payload).subscribe({
      next: (created: Prescription) => {
        this.prescriptions.push(created);
        this.updateStats();
        this.resetForm();
        this.createSuccess = true;
        this.creatingPrescription = false;
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          this.createSuccess = false;
          this.showAddForm = false;
        }, 2000);
      },
      error: (err: any) => {
        this.createError = err.error?.message || 'Failed to create prescription';
        this.creatingPrescription = false;
      }
    });
  }

  getInitials(): string {
    if (!this.examplep) return 'EX';
    const first = this.examplep.firstName?.[0] || '';
    const last = this.examplep.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'EX';
  }

  getAge(): number {
    if (!this.examplep?.dateOfBirth) return 0;
    
    const today = new Date();
    const birth = new Date(this.examplep.dateOfBirth);
    
    if (isNaN(birth.getTime())) return 0;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  getTimeAgo(date: Date | string | null): string {
    if (!date) return 'Never';
    
    const now = new Date().getTime();
    const then = new Date(date).getTime();
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  goBack(): void {
    this.router.navigate(['/app/exampleps']);
  }

  editExamplep(): void {
    if (this.examplep?.id) {
      this.router.navigate(['/app/exampleps', this.examplep.id, 'edit']);
    }
  }
}