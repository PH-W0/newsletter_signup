const card           = document.getElementById('signupCard');
const form           = document.getElementById('newsletterForm');
const emailInput     = document.getElementById('emailInput');
const subscribeBtn   = document.getElementById('subscribeBtn');
const errorMsg       = document.getElementById('errorMsg');
const successOverlay = document.getElementById('successOverlay');
const confirmedEmail = document.getElementById('confirmedEmail');
const dismissBtn     = document.getElementById('dismissBtn');

let isSubmitting = false;

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(email.trim());
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.add('visible');
  emailInput.style.borderColor = '#e53e3e';
  emailInput.setAttribute('aria-invalid', 'true');
  emailInput.setAttribute('aria-describedby', 'errorMsg');
}

function clearError() {
  errorMsg.textContent = '';
  errorMsg.classList.remove('visible');
  emailInput.style.borderColor = '';
  emailInput.removeAttribute('aria-invalid');
  emailInput.removeAttribute('aria-describedby');
}

function setLoading(isLoading) {
  subscribeBtn.disabled    = isLoading;
  subscribeBtn.textContent = isLoading
    ? 'Subscribing…'
    : 'Subscribe to monthly newsletter';
}

function showSuccess(email) {
  confirmedEmail.textContent = email;
  card.classList.add('subscribed');
  successOverlay.setAttribute('tabindex', '-1');
  successOverlay.focus();
}

async function submitToServer(email) {
  const response = await fetch('/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Subscription failed. Please try again.');
  }

  return data;
}

async function handleSubmit(e) {
  e.preventDefault();
  
  if (isSubmitting) return;
  
  const email = emailInput.value.trim();
  clearError();
  
  if (!email) {
    showError('Email address is required.');
    emailInput.focus();
    return;
  }
  
  if (!validateEmail(email)) {
    showError('Please enter a valid email address (e.g., name@example.com).');
    emailInput.focus();
    return;
  }

  isSubmitting = true;
  setLoading(true);

  try {
    await submitToServer(email);
    setLoading(false);
    showSuccess(email);
  } catch (error) {
    setLoading(false);
    if (window.location.protocol === 'file:') {
      showError('This page must be served from the local server. Run `npm start` and open http://localhost:3000.');
    } else if (error instanceof TypeError) {
      showError('Unable to reach the server. Make sure the backend is running on http://localhost:3000.');
    } else {
      showError(error.message || 'Something went wrong. Please try again later.');
    }
    emailInput.focus();
  } finally {
    isSubmitting = false;
  }
}

function handleDismiss() {
  card.classList.remove('subscribed');
  form.reset();      
  clearError();
  setLoading(false);
  emailInput.focus();
}

// Event listeners
form.addEventListener('submit', handleSubmit);
emailInput.addEventListener('input', clearError);
dismissBtn.addEventListener('click', handleDismiss);

window.addEventListener('DOMContentLoaded', () => {
  form.reset();
  clearError();
  setLoading(false);
  card.classList.remove('subscribed');
});

dismissBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleDismiss();
  }
});