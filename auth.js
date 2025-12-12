// js/auth.js
import { 
  auth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  ADMIN_EMAIL,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from './firebase-config.js';

// Check if user is on admin page
const isAdminPage = window.location.pathname.includes('admin.html');

// Login form submission
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const loginSpinner = document.getElementById('loginSpinner');
    const errorDiv = document.getElementById('loginError');
    
    // Show loading
    loginBtn.disabled = true;
    loginSpinner.classList.remove('hidden');
    
    try {
      // Verify it's the admin email
      if (email !== ADMIN_EMAIL) {
        throw new Error('Unauthorized access. Admin only.');
      }
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verify email matches admin email
      if (user.email !== ADMIN_EMAIL) {
        await signOut(auth);
        throw new Error('Unauthorized access. Admin only.');
      }
      
      // Log admin login
      await logAdminAction('ADMIN_LOGIN', { email });
      
      // Redirect to admin dashboard
      window.location.href = 'admin.html';
      
    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.classList.remove('hidden');
      console.error('Login error:', error);
    } finally {
      loginBtn.disabled = false;
      loginSpinner.classList.add('hidden');
    }
  });
}

// Auth state observer
onAuthStateChanged(auth, async (user) => {
  if (isAdminPage) {
    // On admin page, check if user is authenticated and is admin
    if (!user || user.email !== ADMIN_EMAIL) {
      // Not admin, redirect to login
      window.location.href = 'login.html';
    } else {
      // Admin is authenticated
      initializeAdminDashboard();
    }
  } else if (window.location.pathname.includes('login.html')) {
    // On login page, if already logged in as admin, redirect to admin page
    if (user && user.email === ADMIN_EMAIL) {
      window.location.href = 'admin.html';
    }
  }
});

// Logout function
export async function logoutAdmin() {
  try {
    await logAdminAction('ADMIN_LOGOUT', {});
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Log admin actions
async function logAdminAction(action, details) {
  try {
    const timestamp = serverTimestamp();
    const logData = {
      action,
      details,
      timestamp,
      userEmail: auth.currentUser?.email || 'unknown'
    };
    
    const logsRef = collection(db, 'auditLogs');
    await addDoc(logsRef, logData);
    
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}

// Initialize admin dashboard
function initializeAdminDashboard() {
  // Set admin info in UI
  const adminNameEl = document.getElementById('adminName');
  const adminEmailEl = document.getElementById('adminEmail');
  
  if (adminNameEl) {
    adminNameEl.textContent = auth.currentUser.email.split('@')[0];
  }
  if (adminEmailEl) {
    adminEmailEl.textContent = auth.currentUser.email;
  }
  
  // Setup logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutAdmin);
  }
}

// Export functions for other modules
export { logoutAdmin, logAdminAction };