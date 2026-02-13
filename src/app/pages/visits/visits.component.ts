// src/app/pages/visits/visits.component.ts
import { Component, OnInit } from '@angular/core';
import { VisitsService, Visit, VisitCreatePayload } from '../../services/visits.service';
import { ExamplepService, Examplep } from '../../services/examplep.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

interface VisitStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  todayCount: number;
}

interface FilterOptions {
  status: string;
  dateRange: string;
  searchTerm: string;
}

@Component({
  selector: 'app-visits',
  templateUrl: './visits.component.html',
  styleUrls: ['./visits.component.scss']
})
export class VisitsComponent implements OnInit {
  visits: Visit[] = [];
  filteredVisits: Visit[] = [];
  loading = true;
  error = '';

  exampleps: Examplep[] = [];
  loadingExampleps = true;
  
  // Create form
  showCreateModal = false;
  saving = false;
  createError = '';
  createSuccess = false;

  // Form fields
  selectedExamplepId: number | null = null;
  scheduledAt: string = '';
  status: string = 'SCHEDULED';
  notes: string = '';

  // ADDED: Today's date in ISO format for min attribute
  today: string;

  // View mode
  viewMode: 'table' | 'cards' | 'timeline' = 'table';

  // Filters
  filters: FilterOptions = {
    status: 'all',
    dateRange: 'all',
    searchTerm: ''
  };

  // Stats
  stats: VisitStats = {
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    todayCount: 0
  };

  // Status options for dropdown
  statusOptions = [
    { value: 'SCHEDULED', label: 'Scheduled', icon: 'clock' },
    { value: 'COMPLETED', label: 'Completed', icon: 'check' },
    { value: 'CANCELLED', label: 'Cancelled', icon: 'x' }
  ];

  constructor(
    private visitsService: VisitsService,
    private examplepService: ExamplepService,
    private auth: AuthService,
    private toast: ToastService
  ) {
    // Initialize today's date in YYYY-MM-DDTHH:MM format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    this.today = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  ngOnInit(): void {
    this.load();
    this.loadExampleps();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    
    this.visitsService.getAll().subscribe({
      next: (data: Visit[]) => {
        this.visits = data;
        this.applyFilters();
        this.calculateStats();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load visits';
        this.loading = false;
      }
    });
  }

  loadExampleps(): void {
    this.loadingExampleps = true;
    this.examplepService.getAllSimple().subscribe({
      next: (data: Examplep[]) => {
        this.exampleps = data;
        this.loadingExampleps = false;
      },
      error: () => {
        this.loadingExampleps = false;
      }
    });
  }

  private calculateStats(): void {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    this.stats = {
      total: this.visits.length,
      scheduled: this.visits.filter((v: Visit) => v.status === 'SCHEDULED').length,
      completed: this.visits.filter((v: Visit) => v.status === 'COMPLETED').length,
      cancelled: this.visits.filter((v: Visit) => v.status === 'CANCELLED').length,
      todayCount: this.visits.filter((v: Visit) => {
        if (!v.scheduledAt) return false;
        return new Date(v.scheduledAt).toISOString().slice(0, 10) === todayStr;
      }).length
    };
  }

  applyFilters(): void {
    let result = [...this.visits];

    // Filter by status
    if (this.filters.status !== 'all') {
      result = result.filter((v: Visit) => v.status === this.filters.status);
    }

    // Filter by date range
    if (this.filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      result = result.filter((v: Visit) => {
        if (!v.scheduledAt) return false;
        const visitDate = new Date(v.scheduledAt);
        
        switch (this.filters.dateRange) {
          case 'today':
            return visitDate.toDateString() === today.toDateString();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return visitDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return visitDate >= monthAgo;
          case 'upcoming':
            return visitDate >= today;
          default:
            return true;
        }
      });
    }

    // Filter by search term
    if (this.filters.searchTerm) {
      const term = this.filters.searchTerm.toLowerCase();
      result = result.filter((v: Visit) => {
        const examplepName = `${v.examplep?.firstName || ''} ${v.examplep?.lastName || ''}`.toLowerCase();
        const exampledName = (v.exampled?.fullName || '').toLowerCase();
        return examplepName.includes(term) || exampledName.includes(term);
      });
    }

    // Sort by date (newest first)
    result.sort((a: Visit, b: Visit) => {
      const dateA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
      const dateB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
      return dateB - dateA;
    });

    this.filteredVisits = result;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filters = {
      status: 'all',
      dateRange: 'all',
      searchTerm: ''
    };
    this.applyFilters();
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.createError = '';
    this.createSuccess = false;
    this.selectedExamplepId = null;
    this.scheduledAt = '';
    this.status = 'SCHEDULED';
    this.notes = '';
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.createError = '';
    this.createSuccess = false;
  }

  saveVisit(): void {
    if (!this.selectedExamplepId || !this.scheduledAt) {
      this.createError = 'Please select an examplep and schedule date/time.';
      return;
    }

    const user = this.auth.getCurrentUser();
    if (!user) {
      this.createError = 'You must be logged in to create a visit.';
      return;
    }

    const payload: VisitCreatePayload = {
      examplepId: this.selectedExamplepId,
      exampledId: user.id,
      scheduledAt: this.scheduledAt,
      status: this.status,
      notes: this.notes
    };

    this.saving = true;
    this.createError = '';

    this.visitsService.create(payload).subscribe({
      next: (v: Visit) => {
        this.visits.unshift(v);
        this.applyFilters();
        this.calculateStats();
        this.toast.showSuccess('Visit scheduled successfully!');
        this.saving = false;
        this.createSuccess = true;
        
        setTimeout(() => {
          this.closeCreateModal();
        }, 1500);
      },
      error: (err: any) => {
        this.createError = err.error?.message || 'Failed to create visit';
        this.toast.showError(this.createError);
        this.saving = false;
      }
    });
  }

  toggleView(mode: 'table' | 'cards' | 'timeline'): void {
    this.viewMode = mode;
  }

  getExamplepInitials(visit: Visit): string {
    const first = visit.examplep?.firstName?.[0] || '';
    const last = visit.examplep?.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'EX';
  }

  getExampledInitials(visit: Visit): string {
    const name = visit.exampled?.fullName || '';
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

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'COMPLETED': 'status--completed',
      'SCHEDULED': 'status--scheduled',
      'CANCELLED': 'status--cancelled'
    };
    return classes[status] || '';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'COMPLETED': 'Completed',
      'SCHEDULED': 'Scheduled',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  }

  isToday(date: string | Date | undefined): boolean {
    if (!date) return false;
    const today = new Date().toISOString().slice(0, 10);
    return new Date(date).toISOString().slice(0, 10) === today;
  }

  isUpcoming(date: string | Date | undefined): boolean {
    if (!date) return false;
    return new Date(date) > new Date();
  }

  getRelativeTime(date: string | Date | undefined): string {
    if (!date) return '';
    
    const now = new Date();
    const visitDate = new Date(date);
    const diffMs = visitDate.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffDays === 0 && diffHours > 0) {
      return `In ${diffHours} hours`;
    } else if (diffDays === 0 && diffHours <= 0 && diffHours > -24) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays > 1 && diffDays <= 7) {
      return `In ${diffDays} days`;
    } else if (diffDays === -1) {
      return 'Yesterday';
    } else if (diffDays < -1) {
      return `${Math.abs(diffDays)} days ago`;
    }
    return '';
  }

  getSelectedExamplep(): Examplep | undefined {
    if (!this.selectedExamplepId) return undefined;
    return this.exampleps.find((e: Examplep) => e.id === this.selectedExamplepId);
  }

  hasActiveFilters(): boolean {
    return this.filters.status !== 'all' || 
           this.filters.dateRange !== 'all' || 
           this.filters.searchTerm !== '';
  }
}