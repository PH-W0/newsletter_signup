// ↓ Paste your endpoint URL here
const FORM_ENDPOINT = 'https://formspree.io/f/mvznqgjd';

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
  const response = await fetch(FORM_ENDPOINT, {  // ← uses your constant
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
      showError('This page must be served from a server, not opened as a file.');
    } else if (error instanceof TypeError) {
      showError('Unable to reach the server. Check that FORM_ENDPOINT is correct.');
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

form.addEventListener('submit', handleSubmit);
emailInput.addEventListener('input', clearError);
dismissBtn.addEventListener('click', handleDismiss);
dismissBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleDismiss();
  }
});
window.addEventListener('DOMContentLoaded', () => {
  form.reset();
  clearError();
  setLoading(false);
  card.classList.remove('subscribed');
});<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Newsletter Signup</title>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="newsletter-signup.css" />
</head>
<body>

  <div class="card" id="signupCard">
 
    <div class="left">
      <h1>Stay updated!</h1>
      <p class="subtitle">Join 60,000+ product managers receiving monthly updates on:</p>

      <ul class="checklist">
        <li>
          <img src="assets/images/icon-list.svg" alt="" class="check-img">
          Product discovery and building what matters
        </li>
        <li>
          <img src="assets/images/icon-list.svg" alt="" class="check-img">
          Measuring to ensure updates are a success.
        </li>
        <li>
          <img src="assets/images/icon-list.svg" alt="" class="check-img">
          And much more!
        </li>
      </ul>

    <form id="newsletterForm" novalidate>
      <div class="form-group">
        <label for="emailInput">Email address</label>
        <input
          type="email"
          id="emailInput"
          name="email"
          placeholder="siphikazisithole@gmail.com"
          autocomplete="email"
          required
        />
        <span class="error-msg" id="errorMsg"></span>
      </div>

      <button type="submit" class="btn-subscribe" id="subscribeBtn">
        Subscribe to monthly newsletter
      </button>
    </form>
    </div>

    <div class="right">
      <img 
        src="assets/images/illustration-sign-up-desktop.svg" 
        alt="Newsletter illustration"
        class="hero-illustration"
      >
    </div>

    <div class="success-overlay" id="successOverlay" role="alert" aria-live="polite">
      <div class="success-check"></div>
      <h2>Thanks for subscribing!</h2>
      <p>
        A confirmation email has been sent to
        <strong id="confirmedEmail"></strong>.
        Please open it and click the button inside to confirm your subscription.
      </p>
      <button class="btn-dismiss" id="dismissBtn">Dismiss message</button>
    </div>

  </div>

  <script src="newsletter-signup.js"></script>

</body>
</html>
