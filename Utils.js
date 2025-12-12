// js/utils.js
import { logAdminAction } from './auth.js';

// Format date
export function formatDate(date, format = 'medium') {
  if (!date) return 'N/A';
  
  const d = date.toDate ? date.toDate() : new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // medium (default)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Show confirmation dialog
export function showConfirmation(message) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.innerHTML = `
      <div class="confirmation-content">
        <div class="confirmation-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3>Confirm Action</h3>
        <p>${message}</p>
        <div class="confirmation-buttons">
          <button class="btn btn-secondary cancel-btn">Cancel</button>
          <button class="btn btn-danger confirm-btn">Confirm</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      .confirmation-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
      }
      .confirmation-content {
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 400px;
        text-align: center;
        animation: slideUp 0.3s ease;
      }
      .confirmation-icon {
        font-size: 48px;
        color: #f59e0b;
        margin-bottom: 20px;
      }
      .confirmation-content h3 {
        margin-bottom: 10px;
        color: #1f2937;
      }
      .confirmation-content p {
        color: #6b7280;
        margin-bottom: 25px;
      }
      .confirmation-buttons {
        display: flex;
        gap: 15px;
        justify-content: center;
      }
    `;
    document.head.appendChild(styles);
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
      modal.remove();
      styles.remove();
      resolve(false);
    });
    
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
      modal.remove();
      styles.remove();
      resolve(true);
    });
  });
}

// Show success message
export function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Add styles
  const styles = document.createElement('style');
  styles.textContent = `
    .success-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 2000;
      animation: slideInRight 0.3s ease;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
    }
    .success-toast i {
      font-size: 20px;
    }
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(styles);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
      toast.remove();
      styles.remove();
    }, 300);
  }, 3000);
}

// Show loading indicator
export function showLoading(element) {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading-indicator';
  loadingDiv.innerHTML = '<div class="loading-spinner-small"></div>';
  
  element.style.position = 'relative';
  element.appendChild(loadingDiv);
  
  return {
    hide: () => loadingDiv.remove()
  };
}

// Validate email
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Generate random ID
export function generateId(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

// Export data as CSV
export function exportToCSV(data, filename) {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const cell = row[header];
      return typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell;
    }).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Log export
  logAdminAction('EXPORT_CSV', { filename, recordCount: data.length });
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get age from date of birth
export function calculateAge(dob) {
  const birthDate = dob.toDate ? dob.toDate() : new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Check if offline
export function isOffline() {
  return !navigator.onLine;
}

// Setup offline detection
export function setupOfflineDetection() {
  window.addEventListener('online', () => {
    document.getElementById('connectionIcon').className = 'fas fa-wifi';
    document.getElementById('connectionStatus').textContent = 'Online';
    showSuccess('Back online - syncing data...');
  });
  
  window.addEventListener('offline', () => {
    document.getElementById('connectionIcon').className = 'fas fa-wifi-slash';
    document.getElementById('connectionStatus').textContent = 'Offline';
    showError('You are offline. Some features may be limited.');
  });
}