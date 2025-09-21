// Lead form submission handler for webhook (Make.com)
// Uses env override when available, otherwise defaults to provided webhook
const DEFAULT_WEBHOOK_URL = 'https://hook.eu2.make.com/h15kqbjphouh5wvmsnvxopkl7tff8o7u';
const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
const WEBHOOK_TOKEN = import.meta.env.VITE_WEBHOOK_TOKEN; // optional

async function submitLeadForm(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submitBtn = document.getElementById('submitBtn');
  const statusEl = document.getElementById('form-status');
  const timestampInput = document.getElementById('clientTimestamp');

  if (!WEBHOOK_URL) {
    console.error('Missing webhook URL');
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
    // Serialize ALL fields dynamically
    const payload = {};
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        payload[key] = value.trim();
      } else {
        payload[key] = value;
      }
    });
    // Add metadata
    payload.source = window.location.href;
    payload.userAgent = navigator.userAgent;
    if (WEBHOOK_TOKEN) payload.token = WEBHOOK_TOKEN;

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

    // Make.com returns plain text 'Accepted' (no JSON). Treat any 2xx as success.
    const _text = await response.text().catch(() => '');

    if (response.ok) {
      form.reset();
      if (statusEl) {
        statusEl.textContent = 'הטופס נשלח בהצלחה!';
        statusEl.className = 'success';
      }
    } else {
      // Fallback: try sendBeacon to bypass CORS/preflight limitations
      const beaconPayload = new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=UTF-8' });
      const sent = navigator.sendBeacon && navigator.sendBeacon(WEBHOOK_URL, beaconPayload);
      if (sent) {
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
    }
  } catch (error) {
    console.error('Lead form submission error:', error);
    // Fallback on exception as well
    try {
      const form = document.getElementById('lead-form');
      const statusEl = document.getElementById('form-status');
      const formData = form ? new FormData(form) : null;
      const payload = {};
      if (formData) {
        formData.forEach((value, key) => {
          if (typeof value === 'string') payload[key] = value.trim();
          else payload[key] = value;
        });
        payload.source = window.location.href;
        payload.userAgent = navigator.userAgent;
        if (WEBHOOK_TOKEN) payload.token = WEBHOOK_TOKEN;
        const beaconPayload = new Blob([JSON.stringify(payload)], { type: 'text/plain;charset=UTF-8' });
        const sent = navigator.sendBeacon && navigator.sendBeacon(WEBHOOK_URL, beaconPayload);
        if (sent) {
          if (form) form.reset();
          if (statusEl) {
            statusEl.textContent = 'הטופס נשלח בהצלחה!';
            statusEl.className = 'success';
          }
          return;
        }
      }
      if (statusEl) {
        statusEl.textContent = 'ארעה שגיאה בשליחה. נסו שוב.';
        statusEl.className = 'error';
      }
    } catch (_) {
      const statusEl = document.getElementById('form-status');
      if (statusEl) {
        statusEl.textContent = 'ארעה שגיאה בשליחה. נסו שוב.';
        statusEl.className = 'error';
      }
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


