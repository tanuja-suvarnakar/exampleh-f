import { Component } from '@angular/core';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html'
})
export class ToastContainerComponent {
  constructor(public toast: ToastService) {}
}