// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, interval, Subscription } from 'rxjs';

import { ExamplepService, Examplep } from '../../services/examplep.service';
import { VisitsService, Visit } from '../../services/visits.service';
import {
  PrescriptionsService,
  Prescription
} from '../../services/prescriptions.service';

interface VisitStatusCounts {
  COMPLETED: number;
  SCHEDULED: number;
  CANCELLED: number;
}

interface TrendPoint {
  label: string;
  value: number;
  percentage: number;
}

interface TopExamplep {
  examplepId: number;
  examplepName: string;
  count: number;
  percentage: number;
  avatar: string;
}

interface StatCard {
  title: string;
  value: number;
  subtitle: string;
  icon: string;
  trend: number;
  trendLabel: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  error = '';
  currentTime = new Date();
  private timeSubscription?: Subscription;

  // Stats
  totalExampleps = 0;
  totalVisits = 0;
  visitsToday = 0;
  totalExamplepres = 0;
  examplepresLast24h = 0;
  totalExampleds = 0;

  // Stat cards
  statCards: StatCard[] = [];

  // Donut data
  visitStatusCounts: VisitStatusCounts = {
    COMPLETED: 0,
    SCHEDULED: 0,
    CANCELLED: 0
  };
  donutSegments: { offset: number; value: number; color: string; status: string }[] = [];

  // Trend data
  examplepresTrend: TrendPoint[] = [];
  maxTrendValue = 0;
  trendSvgPoints: { x: number; y: number; label: string; value: number }[] = [];
  trendPolylinePoints = '';
  trendAreaPoints = '';

  // Activity data
  recentVisits: Visit[] = [];
  recentExamplepres: Prescription[] = [];
  topExamplepsByExamplepres: TopExamplep[] = [];

  // Animation states
  animateStats = false;

  constructor(
    private examplepService: ExamplepService,
    private visitsService: VisitsService,
    private examplepresService: PrescriptionsService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.timeSubscription = interval(60000).subscribe(() => {
      this.currentTime = new Date();
    });
  }

  ngOnDestroy(): void {
    this.timeSubscription?.unsubscribe();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    this.animateStats = false;

    forkJoin([
      this.examplepService.getAllSimple(),
      this.visitsService.getAll(),
      this.examplepresService.getAll()
    ]).subscribe({
      next: ([examplepsRaw, visitsRaw, examplepresRaw]) => {
        const exampleps = examplepsRaw as Examplep[];
        const visits = visitsRaw as Visit[];
        const examplepres = examplepresRaw as Prescription[];

        this.totalExampleps = exampleps.length;
        this.totalVisits = visits.length;
        this.totalExampleds = this.countUniqueExampleds(visits);

        this.calcVisitsToday(visits);
        this.calcExamplepresStats(examplepres);
        this.buildStatCards();

        this.setupVisitStatusVisual(visits);
        this.setupExamplepresTrendVisual(examplepres);

        this.setupRecentVisits(visits);
        this.setupRecentExamplepres(examplepres);
        this.setupTopExampleps(examplepres);

        this.loading = false;
        
        // Trigger animations
        setTimeout(() => {
          this.animateStats = true;
        }, 100);
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }

  private countUniqueExampleds(visits: Visit[]): number {
    const uniqueIds = new Set<number>();
    visits.forEach((v: Visit) => {
      if (v.exampled?.id) {
        uniqueIds.add(v.exampled.id);
      }
    });
    return uniqueIds.size;
  }

  private calcVisitsToday(visits: Visit[]): void {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    this.visitsToday = visits.filter((v: Visit) => {
      if (!v.scheduledAt) return false;
      const dateStr = new Date(v.scheduledAt).toISOString().slice(0, 10);
      return dateStr === todayStr;
    }).length;
  }

  private calcExamplepresStats(examplepres: Prescription[]): void {
    this.totalExamplepres = examplepres.length;

    const now = new Date().getTime();
    this.examplepresLast24h = examplepres.filter((p: Prescription) => {
      if (!p.issuedAt) return false;
      const issuedTime = new Date(p.issuedAt).getTime();
      const diffHours = (now - issuedTime) / (1000 * 60 * 60);
      return diffHours <= 24;
    }).length;
  }

  private buildStatCards(): void {
    this.statCards = [
      {
        title: 'Total Exampleps',
        value: this.totalExampleps,
        subtitle: 'Registered exampleps',
        icon: 'users',
        trend: 12,
        trendLabel: 'vs last month',
        color: 'indigo'
      },
      {
        title: 'Today\'s Visits',
        value: this.visitsToday,
        subtitle: 'Scheduled appointments',
        icon: 'calendar',
        trend: 8,
        trendLabel: 'vs yesterday',
        color: 'emerald'
      },
      {
        title: 'Examplepres (24h)',
        value: this.examplepresLast24h,
        subtitle: 'New examplepres issued',
        icon: 'prescription',
        trend: -3,
        trendLabel: 'vs yesterday',
        color: 'amber'
      },
      {
        title: 'Active Exampleds',
        value: this.totalExampleds,
        subtitle: 'Medical staff',
        icon: 'doctor',
        trend: 5,
        trendLabel: 'vs last week',
        color: 'sky'
      }
    ];
  }

  private setupVisitStatusVisual(visits: Visit[]): void {
    const counts: VisitStatusCounts = {
      COMPLETED: 0,
      SCHEDULED: 0,
      CANCELLED: 0
    };

    visits.forEach((v: Visit) => {
      const status = v.status as keyof VisitStatusCounts;
      if (status && counts[status] !== undefined) {
        counts[status]++;
      }
    });

    this.visitStatusCounts = counts;

    const total = counts.COMPLETED + counts.SCHEDULED + counts.CANCELLED;
    if (total === 0) {
      this.donutSegments = [];
      return;
    }

    const completedPct = (counts.COMPLETED / total) * 100;
    const scheduledPct = (counts.SCHEDULED / total) * 100;
    const cancelledPct = (counts.CANCELLED / total) * 100;

    let offset = 0;
    this.donutSegments = [];

    if (completedPct > 0) {
      this.donutSegments.push({
        offset,
        value: completedPct,
        color: '#10B981',
        status: 'COMPLETED'
      });
      offset += completedPct;
    }

    if (scheduledPct > 0) {
      this.donutSegments.push({
        offset,
        value: scheduledPct,
        color: '#F59E0B',
        status: 'SCHEDULED'
      });
      offset += scheduledPct;
    }

    if (cancelledPct > 0) {
      this.donutSegments.push({
        offset,
        value: cancelledPct,
        color: '#EF4444',
        status: 'CANCELLED'
      });
    }
  }

  private setupExamplepresTrendVisual(examplepres: Prescription[]): void {
    const countsByDate = new Map<string, number>();

    if (examplepres.length > 0) {
      examplepres.forEach((p: Prescription) => {
        if (!p.issuedAt) return;
        const issued = new Date(p.issuedAt);
        const key = issued.toISOString().slice(0, 10);
        countsByDate.set(key, (countsByDate.get(key) || 0) + 1);
      });
    }

    // Always show last 7 days
    const today = new Date();
    const days: TrendPoint[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const value = countsByDate.get(key) || 0;
      
      days.push({
        label: d.toLocaleDateString(undefined, { weekday: 'short' }),
        value,
        percentage: 0
      });
    }

    this.maxTrendValue = Math.max(...days.map((d: TrendPoint) => d.value), 1);
    
    days.forEach((d: TrendPoint) => {
      d.percentage = (d.value / this.maxTrendValue) * 100;
    });

    this.examplepresTrend = days;
    this.buildTrendSvg();
  }

  private buildTrendSvg(): void {
    const data = this.examplepresTrend;
    if (!data || data.length === 0) {
      this.trendSvgPoints = [];
      this.trendPolylinePoints = '';
      this.trendAreaPoints = '';
      return;
    }

    const n = data.length;
    const padding = 5;
    const width = 100 - (padding * 2);
    const xStep = n === 1 ? 0 : width / (n - 1);

    this.trendSvgPoints = data.map((d: TrendPoint, index: number) => {
      const x = padding + (xStep * index);
      const ratio = this.maxTrendValue > 0 ? d.value / this.maxTrendValue : 0;
      const y = 85 - (ratio * 60);
      return { x, y, label: d.label, value: d.value };
    });

    this.trendPolylinePoints = this.trendSvgPoints
      .map((p: { x: number; y: number }) => `${p.x},${p.y}`)
      .join(' ');

    const firstPoint = this.trendSvgPoints[0];
    const lastPoint = this.trendSvgPoints[this.trendSvgPoints.length - 1];
    this.trendAreaPoints = `${firstPoint.x},90 ${this.trendPolylinePoints} ${lastPoint.x},90`;
  }

  private setupRecentVisits(visits: Visit[]): void {
    this.recentVisits = [...visits]
      .filter((v: Visit) => !!v.scheduledAt)
      .sort((a: Visit, b: Visit) =>
        new Date(b.scheduledAt!).getTime() - new Date(a.scheduledAt!).getTime()
      )
      .slice(0, 5);
  }

  private setupRecentExamplepres(examplepres: Prescription[]): void {
    this.recentExamplepres = [...examplepres]
      .filter((p: Prescription) => !!p.issuedAt)
      .sort((a: Prescription, b: Prescription) =>
        new Date(b.issuedAt!).getTime() - new Date(a.issuedAt!).getTime()
      )
      .slice(0, 5);
  }

  private setupTopExampleps(examplepres: Prescription[]): void {
    const map = new Map<number, { name: string; count: number }>();

    examplepres.forEach((p: Prescription) => {
      if (!p.examplep) return;
      const id = p.examplep.id;
      const name = `${p.examplep.firstName || ''} ${p.examplep.lastName || ''}`.trim();
      const existing = map.get(id) || { name, count: 0 };
      existing.count++;
      map.set(id, existing);
    });

    const maxCount = Math.max(...Array.from(map.values()).map((v: { count: number }) => v.count), 1);

    this.topExamplepsByExamplepres = Array.from(map.entries())
      .map(([examplepId, info]) => ({
        examplepId,
        examplepName: info.name || `Examplep #${examplepId}`,
        count: info.count,
        percentage: (info.count / maxCount) * 100,
        avatar: this.getInitials(info.name || 'U')
      }))
      .sort((a: TopExamplep, b: TopExamplep) => b.count - a.count)
      .slice(0, 5);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'COMPLETED': 'status-completed',
      'SCHEDULED': 'status-scheduled',
      'CANCELLED': 'status-cancelled'
    };
    return classes[status] || '';
  }

  getTimeAgo(date: string | Date): string {
    const now = new Date().getTime();
    const then = new Date(date).getTime();
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  getGreeting(): string {
    const hour = this.currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
}