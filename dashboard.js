// js/dashboard.js
import { 
  db, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot 
} from './firebase-config.js';
import { logAdminAction } from './auth.js';

let dashboardData = {
  facilities: [],
  users: [],
  children: [],
  immunizations: []
};

let charts = {};

// Initialize dashboard
export async function initializeDashboard() {
  try {
    // Fetch initial data
    await fetchDashboardData();
    
    // Setup real-time listeners
    setupRealtimeListeners();
    
    // Initialize charts
    initializeCharts();
    
    // Setup filters
    setupFilters();
    
    // Update date display
    updateDateDisplay();
    
    // Hide loading overlay
    document.getElementById('loadingOverlay').style.display = 'none';
    
    // Setup navigation
    setupNavigation();
    
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    showError('Failed to load dashboard data');
  }
}

// Fetch all dashboard data
async function fetchDashboardData() {
  try {
    // Fetch facilities
    const facilitiesSnapshot = await getDocs(collection(db, 'facilities'));
    dashboardData.facilities = facilitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Fetch users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    dashboardData.users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Fetch children
    const childrenSnapshot = await getDocs(collection(db, 'children'));
    dashboardData.children = childrenSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Fetch recent immunizations
    const immunizationsQuery = query(
      collection(db, 'immunizations'),
      orderBy('date', 'desc'),
      limit(10)
    );
    const immunizationsSnapshot = await getDocs(immunizationsQuery);
    dashboardData.immunizations = immunizationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Update UI
    updateDashboardStats();
    updateRecentImmunizationsTable();
    updateFacilityFilter();
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
}

// Setup real-time listeners
function setupRealtimeListeners() {
  // Listen for new facilities
  onSnapshot(collection(db, 'facilities'), (snapshot) => {
    dashboardData.facilities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    updateDashboardStats();
    updateFacilityFilter();
  });
  
  // Listen for new users
  onSnapshot(collection(db, 'users'), (snapshot) => {
    dashboardData.users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    updateDashboardStats();
  });
  
  // Listen for new children
  onSnapshot(collection(db, 'children'), (snapshot) => {
    dashboardData.children = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    updateDashboardStats();
  });
  
  // Listen for new immunizations
  const immunizationsQuery = query(
    collection(db, 'immunizations'),
    orderBy('date', 'desc'),
    limit(10)
  );
  
  onSnapshot(immunizationsQuery, (snapshot) => {
    dashboardData.immunizations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    updateDashboardStats();
    updateRecentImmunizationsTable();
  });
}

// Update dashboard statistics
function updateDashboardStats() {
  // Update counts
  document.getElementById('totalFacilities').textContent = dashboardData.facilities.length;
  document.getElementById('totalUsers').textContent = dashboardData.users.length;
  document.getElementById('totalChildren').textContent = dashboardData.children.length;
  document.getElementById('totalImmunizations').textContent = dashboardData.immunizations.length;
  
  // Calculate coverage rate (example logic)
  const coverageRate = dashboardData.children.length > 0 
    ? Math.min(100, Math.round((dashboardData.immunizations.length / (dashboardData.children.length * 10)) * 100))
    : 0;
  document.getElementById('coverageRate').textContent = `${coverageRate}%`;
  
  // Update charts data
  updateChartsData();
}

// Update recent immunizations table
function updateRecentImmunizationsTable() {
  const tableBody = document.querySelector('#recentImmunizationsTable tbody');
  tableBody.innerHTML = '';
  
  dashboardData.immunizations.forEach(record => {
    const row = document.createElement('tr');
    
    // Format date
    const date = record.date?.toDate ? record.date.toDate() : new Date(record.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    row.innerHTML = `
      <td>${record.childName || 'Unknown'}</td>
      <td><span class="vaccine-badge">${record.vaccineName || 'Unknown'}</span></td>
      <td>${record.facilityName || 'Unknown'}</td>
      <td>${formattedDate}</td>
      <td><span class="status-badge status-completed">Completed</span></td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Update facility filter dropdown
function updateFacilityFilter() {
  const filterSelect = document.getElementById('facilityFilter');
  const currentSelections = Array.from(filterSelect.selectedOptions).map(opt => opt.value);
  
  // Clear existing options except "All Facilities"
  filterSelect.innerHTML = '<option value="all">All Facilities</option>';
  
  // Add facility options
  dashboardData.facilities.forEach(facility => {
    const option = document.createElement('option');
    option.value = facility.id;
    option.textContent = facility.name || facility.id;
    option.selected = currentSelections.includes(facility.id);
    filterSelect.appendChild(option);
  });
  
  // Re-select "all" if it was selected
  if (currentSelections.includes('all')) {
    filterSelect.querySelector('option[value="all"]').selected = true;
  }
}

// Initialize charts
function initializeCharts() {
  // Trend Chart
  const trendCtx = document.getElementById('trendChart').getContext('2d');
  charts.trend = new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Immunizations',
        data: [65, 78, 90, 81, 96, 105],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
  
  // Facility Comparison Chart
  const facilityCtx = document.getElementById('facilityChart').getContext('2d');
  charts.facility = new Chart(facilityCtx, {
    type: 'bar',
    data: {
      labels: ['Facility A', 'Facility B', 'Facility C', 'Facility D'],
      datasets: [{
        label: 'Immunizations',
        data: [120, 95, 78, 110],
        backgroundColor: [
          '#4f46e5',
          '#10b981',
          '#f59e0b',
          '#ef4444'
        ],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
  
  // Vaccine Coverage Chart
  const vaccineCtx = document.getElementById('vaccineChart').getContext('2d');
  charts.vaccine = new Chart(vaccineCtx, {
    type: 'doughnut',
    data: {
      labels: ['BCG', 'OPV', 'Penta', 'PCV', 'Measles'],
      datasets: [{
        data: [95, 88, 92, 85, 78],
        backgroundColor: [
          '#4f46e5',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
  
  // Role Distribution Chart
  const roleCtx = document.getElementById('roleChart').getContext('2d');
  charts.role = new Chart(roleCtx, {
    type: 'polarArea',
    data: {
      labels: ['Admin', 'Doctors', 'Nurses', 'Data Entry'],
      datasets: [{
        data: [1, 15, 28, 42],
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Update charts with real data
function updateChartsData() {
  // This would be updated with real data from Firestore
  // For now, using sample data
}

// Setup filters
function setupFilters() {
  const facilityFilter = document.getElementById('facilityFilter');
  const timeFilter = document.getElementById('timeFilter');
  const trendFilter = document.getElementById('trendFilter');
  
  facilityFilter.addEventListener('change', applyFilters);
  timeFilter.addEventListener('change', applyFilters);
  trendFilter.addEventListener('change', applyFilters);
}

// Apply filters
function applyFilters() {
  const selectedFacilities = Array.from(document.getElementById('facilityFilter').selectedOptions)
    .map(opt => opt.value);
  const timeRange = document.getElementById('timeFilter').value;
  const trendType = document.getElementById('trendFilter').value;
  
  // Log filter change
  logAdminAction('DASHBOARD_FILTER_CHANGE', {
    facilities: selectedFacilities,
    timeRange,
    trendType
  });
  
  // Here you would filter your data and update charts
  console.log('Filters applied:', { selectedFacilities, timeRange, trendType });
}

// Setup navigation
function setupNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav li[data-section]');
  const pageTitle = document.getElementById('pageTitle');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active class from all
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add active class to clicked
      item.classList.add('active');
      
      // Hide all sections
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Show selected section
      const sectionId = item.getAttribute('data-section');
      document.getElementById(`${sectionId}Section`).classList.add('active');
      
      // Update page title
      pageTitle.textContent = item.querySelector('span').textContent;
      
      // Log navigation
      logAdminAction('NAVIGATION', { section: sectionId });
    });
  });
}

// Update date display
function updateDateDisplay() {
  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `;
  
  document.querySelector('.content-wrapper').prepend(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('admin.html')) {
    initializeDashboard();
  }
});