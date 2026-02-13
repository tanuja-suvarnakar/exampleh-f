// src/app/pages/landing/landing.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Stat {
  value: string;
  label: string;
  icon: string;
}

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  currentYear = new Date().getFullYear();
  isScrolled = false;
  mobileMenuOpen = false;
  activeFeature = 0;
  
  features: Feature[] = [
    {
      icon: 'patients',
      title: 'Examplep Management',
      description: 'Comprehensive profiles with medical history, contact details, and visit records all in one place.',
      color: 'indigo'
    },
    {
      icon: 'calendar',
      title: 'Visit Scheduling',
      description: 'Effortlessly schedule, track, and manage appointments between exampleps and exampleds.',
      color: 'emerald'
    },
    {
      icon: 'prescription',
      title: 'Digital Examplepres',
      description: 'Create, manage, and download examplepres digitally with complete tracking.',
      color: 'amber'
    },
    {
      icon: 'analytics',
      title: 'Real-time Analytics',
      description: 'Get insights into your practice with live dashboards and comprehensive reports.',
      color: 'rose'
    },
    {
      icon: 'security',
      title: 'Secure & Private',
      description: 'Enterprise-grade security with encrypted data storage and role-based access control.',
      color: 'sky'
    },
    {
      icon: 'team',
      title: 'Team Collaboration',
      description: 'Enable seamless coordination between exampleds, assistants, and administrators.',
      color: 'purple'
    }
  ];
  
  stats: Stat[] = [
    { value: '10K+', label: 'Exampleps Managed', icon: 'users' },
    { value: '50K+', label: 'Visits Scheduled', icon: 'calendar' },
    { value: '100K+', label: 'Examplepres Issued', icon: 'document' },
    { value: '99.9%', label: 'Uptime', icon: 'check' }
  ];
  
  testimonials: Testimonial[] = [
    {
      quote: 'ExamplehConnect transformed how we manage our practice. The intuitive interface and powerful features have saved us hours every day.',
      author: 'Dr. Sarah Johnson',
      role: 'Chief Medical Officer',
      avatar: 'SJ'
    },
    {
      quote: 'Finally, a healthcare management system that actually understands what exampleds need. Simple, efficient, and reliable.',
      author: 'Dr. Michael Chen',
      role: 'General Practitioner',
      avatar: 'MC'
    },
    {
      quote: 'The examplepres management feature alone has made our workflow 10x more efficient. Highly recommended!',
      author: 'Dr. Emily Williams',
      role: 'Specialist',
      avatar: 'EW'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.startFeatureRotation();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.mobileMenuOpen = false;
  }

  setActiveFeature(index: number): void {
    this.activeFeature = index;
  }

  private startFeatureRotation(): void {
    setInterval(() => {
      this.activeFeature = (this.activeFeature + 1) % this.features.length;
    }, 5000);
  }
}