// ===================================
// Animations on Scroll (Simple Implementation)
// ===================================
document.addEventListener('DOMContentLoaded', function() {
  // Initialize animations
  initAnimations();
  
  // Handle login button
  const loginBtn = document.getElementById('loginBtn');
  const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
  
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      loginModal.show();
    });
  }
  
  // Handle nav signup button
  const navSignupBtn = document.getElementById('navSignupBtn');
  if (navSignupBtn) {
    navSignupBtn.addEventListener('click', function() {
      signupModal.show();
    });
  }
  
  // Handle signup button
  const signupBtn = document.getElementById('signupBtn');
  const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
  
  if (signupBtn) {
    signupBtn.addEventListener('click', function() {
      signupModal.show();
    });
  }
  
  // Switch between login and signup modals
  const switchToSignup = document.getElementById('switchToSignup');
  const switchToLogin = document.getElementById('switchToLogin');
  
  if (switchToSignup) {
    switchToSignup.addEventListener('click', function(e) {
      e.preventDefault();
      loginModal.hide();
      setTimeout(() => signupModal.show(), 300);
    });
  }
  
  if (switchToLogin) {
    switchToLogin.addEventListener('click', function(e) {
      e.preventDefault();
      signupModal.hide();
      setTimeout(() => loginModal.show(), 300);
    });
  }
  
  // Handle login form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Handle signup form submission
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
  
  // Navbar scroll effect
  handleNavbarScroll();
  
  // Animate numbers
  animateNumbers();
});

// ===================================
// Animation on Scroll
// ===================================
function initAnimations() {
  const elements = document.querySelectorAll('[data-aos]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  elements.forEach(el => {
    observer.observe(el);
  });
}

// ===================================
// Handle Login Form
// ===================================
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  try {
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Logging in...';
    
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Show success message
      showToast('Welcome back! Login successful!', 'success');
      
      // Redirect to dashboard after delay
      setTimeout(() => {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      }, 1500);
    } else {
      showToast(data.message || 'Invalid credentials!', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Failed to login. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// ===================================
// Handle Signup Form
// ===================================
async function handleSignup(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  try {
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating...';
    
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, phone, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Show success message
      showToast('Success! Welcome to Skill Up!', 'success');
      
      // Redirect to dashboard after delay
      setTimeout(() => {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      }, 1500);
    } else {
      showToast(data.message || 'Something went wrong!', 'error');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showToast('Failed to create account. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// ===================================
// Toast Notification
// ===================================
function showToast(message, type = 'info') {
  // Remove existing toast if any
  const existingToast = document.querySelector('.custom-toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = `custom-toast toast-${type}`;
  toast.textContent = message;
  
  // Add styles
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#00d9a3' : '#ff4757'};
    color: #fff;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    font-weight: 600;
    z-index: 9999;
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add keyframes for toast animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ===================================
// Navbar Scroll Effect
// ===================================
function handleNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(15, 22, 36, 0.98)';
      navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
    } else {
      navbar.style.background = 'rgba(15, 22, 36, 0.95)';
      navbar.style.boxShadow = 'none';
    }
  });
}

// ===================================
// Animate Numbers (Count Up Effect)
// ===================================
function animateNumbers() {
  const statsNumber = document.querySelector('.stats-number');
  
  if (!statsNumber) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsNumber.classList.contains('counted')) {
        statsNumber.classList.add('counted');
        
        // Extract number from text (e.g., "10,000+" -> 10000)
        const target = parseInt(statsNumber.textContent.replace(/[^0-9]/g, ''));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            statsNumber.textContent = '10,000+';
            clearInterval(timer);
          } else {
            statsNumber.textContent = Math.floor(current).toLocaleString() + '+';
          }
        }, 16);
      }
    });
  }, { threshold: 0.5 });
  
  observer.observe(statsNumber);
}

// ===================================
// Smooth Scroll for Navigation Links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href !== '') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

// ===================================
// Parallax Effect for Background
// ===================================
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxElements = document.querySelectorAll('.floating-dots');
  
  parallaxElements.forEach(el => {
    const speed = 0.5;
    el.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

// ===================================
// Feature Items Hover Effect
// ===================================
document.querySelectorAll('.feature-item').forEach(item => {
  item.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-5px) scale(1.05)';
  });
  
  item.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

// ===================================
// Console Welcome Message
// ===================================
console.log('%c🚀 Welcome to Skill Up!', 'color: #00d9a3; font-size: 20px; font-weight: bold;');
console.log('%cMaster Coding, System Design, and Aptitude', 'color: #5b6ef7; font-size: 14px;');
