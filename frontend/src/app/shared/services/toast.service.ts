import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  showToast(message: string, type: 'success' | 'error' = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast toast-end z-50';
    
    // Create message element
    const alert = document.createElement('div');
    alert.className = `alert ${type === 'success' ? 'alert-success bg-green-600' : 'alert-error bg-red-600'} text-white font-semibold`;
    
    // Create icon element
    const icon = document.createElement('span');
    if (type === 'success') {
      icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      `;
    } else {
      icon.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      `;
    }
    
    // Create message span
    const span = document.createElement('span');
    span.textContent = message;
    
    // Assemble toast
    alert.appendChild(icon);
    alert.appendChild(span);
    toast.appendChild(alert);
    document.body.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
} 