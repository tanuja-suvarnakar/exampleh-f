// src/app/pages/examplep-form/examplep-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamplepService, Examplep } from '../../services/examplep.service';

@Component({
  selector: 'app-examplep-form',
  templateUrl: './examplep-form.component.html',
  styleUrls: ['./examplep-form.component.scss']
})
export class ExamplepFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  examplepId?: number;
  loading = false;
  saving = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private examplepService: ExamplepService
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    // Check if we're in edit mode
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam && idParam !== 'new') {
      this.isEditMode = true;
      this.examplepId = +idParam;
      
      // Validate that it's a number
      if (isNaN(this.examplepId)) {
        this.error = 'Invalid examplep ID';
        return;
      }
      
      this.loadExamplep();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', Validators.required],
      gender: [''],
      phone: [''],
      email: ['', Validators.email],
      address: ['']
    });
  }

  private loadExamplep(): void {
    if (!this.examplepId) return;
    
    this.loading = true;
    this.examplepService.getById(this.examplepId).subscribe({
      next: (examplep) => {
        this.form.patchValue({
          firstName: examplep.firstName,
          lastName: examplep.lastName,
          dateOfBirth: examplep.dateOfBirth,
          gender: examplep.gender,
          phone: examplep.phone,
          email: examplep.email,
          address: examplep.address
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load examplep';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';

    const examplepData: Examplep = this.form.value;

    const request$ = this.isEditMode && this.examplepId
      ? this.examplepService.update(this.examplepId, examplepData)
      : this.examplepService.create(examplepData);

    request$.subscribe({
      next: (result) => {
        this.saving = false;
        // Navigate to the detail page or list
        if (result.id) {
          this.router.navigate(['/app/exampleps', result.id]);
        } else {
          this.router.navigate(['/app/exampleps']);
        }
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Failed to save examplep';
      }
    });
  }

  cancel(): void {
    if (this.isEditMode && this.examplepId) {
      this.router.navigate(['/app/exampleps', this.examplepId]);
    } else {
      this.router.navigate(['/app/exampleps']);
    }
  }

  // Form field getters for easy template access
  get f() {
    return this.form.controls;
  }
}