// src/app/pages/prescriptions/prescriptions.component.ts
import { Component, OnInit } from '@angular/core';
import {
  PrescriptionsService,
  Prescription
} from '../../services/prescriptions.service';

interface PrescriptionStats {
  total: number;
  thisWeek: number;
  thisMonth: number;
  uniqueExampleps: number;
}

interface FilterOptions {
  fromDate: string;
  toDate: string;
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-prescriptions',
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.scss']
})
export class PrescriptionsComponent implements OnInit {
  prescriptions: Prescription[] = [];
  loading = true;
  error = '';

  // View mode
  viewMode: 'table' | 'cards' | 'list' = 'table';

  // Filters
  filters: FilterOptions = {
    fromDate: '',
    toDate: '',
    searchTerm: '',
    sortBy: 'issuedAt',
    sortOrder: 'desc'
  };

  // Stats
  stats: PrescriptionStats = {
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    uniqueExampleps: 0
  };

  // Date constraints
  today: string;
  
  // Expanded cards (for card view)
  expandedCardId: number | null = null;

  constructor(private prescriptionsService: PrescriptionsService) {
    this.today = new Date().toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.loading = true;
    this.error = '';

    const filter: { from?: string; to?: string } = {};
    if (this.filters.fromDate) filter.from = this.filters.fromDate;
    if (this.filters.toDate) filter.to = this.filters.toDate;

    this.prescriptionsService.getAll(filter).subscribe({
      next: (data: Prescription[]) => {
        this.prescriptions = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load prescriptions';
        this.loading = false;
      }
    });
  }

  private calculateStats(): void {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const uniqueExamplepIds = new Set<number>();

    this.stats.total = this.prescriptions.length;
    
    this.stats.thisWeek = this.prescriptions.filter((p: Prescription) => {
      if (!p.issuedAt) return false;
      return new Date(p.issuedAt) >= weekAgo;
    }).length;

    this.stats.thisMonth = this.prescriptions.filter((p: Prescription) => {
      if (!p.issuedAt) return false;
      return new Date(p.issuedAt) >= monthAgo;
    }).length;

    this.prescriptions.forEach((p: Prescription) => {
      if (p.examplep?.id) {
        uniqueExamplepIds.add(p.examplep.id);
      }
    });
    
    this.stats.uniqueExampleps = uniqueExamplepIds.size;
  }

  clearFilters(): void {
    this.filters = {
      fromDate: '',
      toDate: '',
      searchTerm: '',
      sortBy: 'issuedAt',
      sortOrder: 'desc'
    };
    this.loadPrescriptions();
  }

  onFilterChange(): void {
    // Triggers re-computation of filteredPrescriptions getter
  }

  applyDateFilter(): void {
    this.loadPrescriptions();
  }

  toggleView(mode: 'table' | 'cards' | 'list'): void {
    this.viewMode = mode;
  }

  toggleSort(field: string): void {
    if (this.filters.sortBy === field) {
      this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = field;
      this.filters.sortOrder = 'desc';
    }
  }

  toggleCardExpand(id: number): void {
    this.expandedCardId = this.expandedCardId === id ? null : id;
  }

  get filteredPrescriptions(): Prescription[] {
    let result = [...this.prescriptions];

    // Search filter
    if (this.filters.searchTerm) {
      const term = this.filters.searchTerm.toLowerCase();
      result = result.filter((p: Prescription) => {
        const examplepName = `${p.examplep?.firstName || ''} ${p.examplep?.lastName || ''}`.toLowerCase();
        const exampledName = (p.exampled?.fullName || '').toLowerCase();
        const medication = (p.medication || '').toLowerCase();
        return examplepName.includes(term) || 
               exampledName.includes(term) || 
               medication.includes(term);
      });
    }

    // Sorting
    result.sort((a: Prescription, b: Prescription) => {
      let valueA: any;
      let valueB: any;

      switch (this.filters.sortBy) {
        case 'issuedAt':
          valueA = a.issuedAt ? new Date(a.issuedAt).getTime() : 0;
          valueB = b.issuedAt ? new Date(b.issuedAt).getTime() : 0;
          break;
        case 'medication':
          valueA = (a.medication || '').toLowerCase();
          valueB = (b.medication || '').toLowerCase();
          break;
        case 'examplep':
          valueA = `${a.examplep?.firstName || ''} ${a.examplep?.lastName || ''}`.toLowerCase();
          valueB = `${b.examplep?.firstName || ''} ${b.examplep?.lastName || ''}`.toLowerCase();
          break;
        default:
          valueA = a.issuedAt ? new Date(a.issuedAt).getTime() : 0;
          valueB = b.issuedAt ? new Date(b.issuedAt).getTime() : 0;
      }

      if (this.filters.sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    return result;
  }

  hasActiveFilters(): boolean {
    return this.filters.fromDate !== '' || 
           this.filters.toDate !== '' || 
           this.filters.searchTerm !== '';
  }

  getExamplepInitials(prescription: Prescription): string {
    const first = prescription.examplep?.firstName?.[0] || '';
    const last = prescription.examplep?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'EX';
  }

  getExampledInitials(prescription: Prescription): string {
    const name = prescription.exampled?.fullName || '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase() || 'ED';
  }

  getAvatarColor(id: number | undefined): string {
    const colors = [
      'avatar--indigo',
      'avatar--emerald',
      'avatar--amber',
      'avatar--rose',
      'avatar--sky',
      'avatar--purple',
      'avatar--teal'
    ];
    return colors[(id || 0) % colors.length];
  }

  getMedicationIcon(medication: string): string {
    const med = medication.toLowerCase();
    if (med.includes('tablet') || med.includes('pill')) return 'pill';
    if (med.includes('syrup') || med.includes('liquid')) return 'syrup';
    if (med.includes('injection') || med.includes('vaccine')) return 'injection';
    if (med.includes('cream') || med.includes('ointment')) return 'cream';
    if (med.includes('drop')) return 'drops';
    return 'pill';
  }

  getTimeAgo(date: string | Date | undefined): string {
    if (!date) return '';
    
    const now = new Date().getTime();
    const then = new Date(date).getTime();
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  }

  isRecent(date: string | Date | undefined): boolean {
    if (!date) return false;
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return new Date(date) >= dayAgo;
  }

  downloadPrescription(prescription: Prescription): void {
    this.prescriptionsService.downloadPrescription(prescription.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `prescription-${prescription.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => {
        console.error('Download failed:', err);
      }
    });
  }

  exportToCSV(): void {
    const headers = ['ID', 'Examplep', 'Medication', 'Dosage', 'Instructions', 'Issued At', 'Exampled'];
    const rows = this.filteredPrescriptions.map((p: Prescription) => [
      p.id,
      `${p.examplep?.firstName || ''} ${p.examplep?.lastName || ''}`,
      p.medication,
      p.dosage,
      p.instructions,
      p.issuedAt ? new Date(p.issuedAt).toLocaleDateString() : '',
      p.exampled?.fullName || ''
    ]);

    const csvContent = [headers, ...rows]
      .map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescriptions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}