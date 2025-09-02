// Lead form submission handler for Google Apps Script webhook
// Requirements: VITE_WEBHOOK_URL and VITE_WEBHOOK_TOKEN in environment

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL;
const WEBHOOK_TOKEN = import.meta.env.VITE_WEBHOOK_TOKEN;

async function submitLeadForm(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitBtn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('form-status');
  const timestampInput = document.getElementById('clientTimestamp');

  if (!WEBHOOK_URL || !WEBHOOK_TOKEN) {
    console.error('Missing VITE_WEBHOOK_URL or VITE_WEBHOOK_TOKEN');
    if (statusEl) {
      statusEl.textContent = 'ארעה שגיאה בשליחה. נסו שוב.';
      statusEl.className = 'error';
    }
    return;
  }

  try {
    if (timestampInput) {
      timestampInput.value = new Date().toISOString();
    }

    const formData = new FormData(form);
    const payload = {
      fullName: formData.get('fullName')?.toString().trim() || '',
      phone: formData.get('phone')?.toString().trim() || '',
      email: formData.get('email')?.toString().trim() || '',
      business: formData.get('business')?.toString().trim() || '',
      clientTimestamp: formData.get('clientTimestamp')?.toString() || '',
      source: window.location.href,
      userAgent: navigator.userAgent,
      token: WEBHOOK_TOKEN,
    };

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
    }
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className = '';
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data && data.ok === true) {
      form.reset();
      if (statusEl) {
        statusEl.textContent = 'הטופס נשלח בהצלחה!';
        statusEl.className = 'success';
      }
    } else {
      if (statusEl) {
        statusEl.textContent = 'ארעה שגיאה בשליחה. נסו שוב.';
        statusEl.className = 'error';
      }
    }
  } catch (error) {
    console.error('Lead form submission error:', error);
    const statusEl = document.getElementById('form-status');
    if (statusEl) {
      statusEl.textContent = 'ארעה שגיאה בשליחה. נסו שוב.';
      statusEl.className = 'error';
    }
  } finally {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  }
}

function initLeadForm() {
  const form = document.getElementById('lead-form');
  if (form) {
    // Avoid duplicate listeners (e.g., HMR)
    form.removeEventListener('submit', submitLeadForm);
    form.addEventListener('submit', submitLeadForm);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeadForm, { once: true });
} else {
  // DOM is already ready
  initLeadForm();
}

export {};


