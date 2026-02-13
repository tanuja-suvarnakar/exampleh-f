// src/app/pages/examplep-list/examplep-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ExamplepService, Examplep, Page } from '../../services/examplep.service';
import { Router } from '@angular/router';

interface ExamplepStats {
  total: number;
  newThisMonth: number;
  activeToday: number;
}

@Component({
  selector: 'app-examplep-list',
  templateUrl: './examplep-list.component.html',
  styleUrls: ['./examplep-list.component.scss']
})
export class ExamplepListComponent implements OnInit {
  pageData?: Page<Examplep>;
  loading = true;
  error = '';

  searchTerm = '';
  pageIndex = 0;
  pageSize = 5;
  
  // View mode: 'table' or 'grid'
  viewMode: 'table' | 'grid' = 'table';
  
  // Stats
  stats: ExamplepStats = {
    total: 0,
    newThisMonth: 0,
    activeToday: 0
  };

  // Sort
  sortField: string = 'lastName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private examplepService: ExamplepService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    
    this.examplepService.getPaged(this.pageIndex, this.pageSize, this.searchTerm).subscribe({
      next: (data: Page<Examplep>) => {
        this.pageData = data;
        this.updateStats(data);
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to load exampleps';
        this.loading = false;
      }
    });
  }

  private updateStats(data: Page<Examplep>): void {
    this.stats.total = data.totalElements;
    
    // Calculate new this month (mock calculation)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    this.stats.newThisMonth = Math.floor(data.totalElements * 0.15);
    this.stats.activeToday = Math.floor(data.totalElements * 0.08);
  }

  searchChanged(): void {
    this.pageIndex = 0;
    this.load();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchChanged();
  }

  goToPage(index: number): void {
    if (!this.pageData) return;
    if (index < 0 || index >= this.pageData.totalPages) return;
    this.pageIndex = index;
    this.load();
  }

  openDetail(id: number): void {
    this.router.navigate(['/app/exampleps', id]);
  }

  createNew(): void {
    this.router.navigate(['/app/exampleps/new']);
  }

  toggleView(mode: 'table' | 'grid'): void {
    this.viewMode = mode;
  }

  getInitials(examplep: Examplep): string {
    const first = examplep.firstName?.[0] || '';
    const last = examplep.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'EX';
  }

  getAvatarColor(examplep: Examplep): string {
    const colors = [
      'avatar--indigo',
      'avatar--emerald',
      'avatar--amber',
      'avatar--rose',
      'avatar--sky',
      'avatar--purple',
      'avatar--teal'
    ];
    const index = (examplep.id || 0) % colors.length;
    return colors[index];
  }

  // FIXED: Accept undefined and handle it
  getAge(dateOfBirth: string | Date | undefined | null): number {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birth = new Date(dateOfBirth);
    
    // Check if the date is valid
    if (isNaN(birth.getTime())) return 0;
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  getPageNumbers(): number[] {
    if (!this.pageData) return [];
    
    const totalPages = this.pageData.totalPages;
    const currentPage = this.pageData.number;
    const pages: number[] = [];
    
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);
    
    // Adjust if we're near the beginning or end
    if (currentPage < 2) {
      endPage = Math.min(4, totalPages - 1);
    }
    if (currentPage > totalPages - 3) {
      startPage = Math.max(0, totalPages - 5);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  get exampleps(): Examplep[] {
    return this.pageData?.content || [];
  }

  get showingFrom(): number {
    if (!this.pageData) return 0;
    return this.pageData.number * this.pageData.size + 1;
  }

  get showingTo(): number {
    if (!this.pageData) return 0;
    return Math.min(
      (this.pageData.number + 1) * this.pageData.size,
      this.pageData.totalElements
    );
  }
}