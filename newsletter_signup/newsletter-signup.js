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

function encode(data) {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
}

async function submitToNetlify(email) {
  const response = await fetch('/', {
    method : 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body   : encode({
      'form-name': 'newsletter',
      'email'    : email,
    }),
  });

  if (!response.ok) {
    throw new Error('Submission failed. Please try again.');
  }
  return response;
}

async function handleSubmit(e) {
  e.preventDefault();
  
  // Prevent duplicate submissions
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
    await submitToNetlify(email);
    showSuccess(email);
  } catch (error) {
    setLoading(false);
    showError(error.message || 'Something went wrong. Please try again later.');
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