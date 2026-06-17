import { useState, useEffect } from 'react';

const API_BASE_URL = '/api/public';

// Read customer from localStorage (set by CustomerLoginApp after login)
const getStoredCustomer = () => {
  try {
    const stored = localStorage.getItem('customer');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Generate time slots every 30 min from 10:00 AM to 10:00 PM
const TIME_SLOTS = (() => {
  const slots = [];
  for (let h = 10; h <= 22; h++) {
    ['00', '30'].forEach(m => {
      if (h === 22 && m === '30') return;
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      slots.push({
        value: `${String(h).padStart(2, '0')}:${m}`,
        label: `${hour12}:${m} ${ampm}`,
      });
    });
  }
  return slots;
})();

// Today's date in YYYY-MM-DD (local time, not UTC)
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: #040d08; }

  .bk-page {
    min-height: 100vh;
    background: radial-gradient(ellipse at 30% 20%, #112218 0%, #040d08 60%),
                radial-gradient(ellipse at 80% 80%, #0d2219 0%, transparent 50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 16px 60px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #e8e0cd;
  }

  .bk-header {
    text-align: center;
    margin-bottom: 36px;
  }
  .bk-logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }
  .bk-logo-dot {
    width: 10px; height: 10px;
    background: #cfad56;
    border-radius: 50%;
    box-shadow: 0 0 10px #cfad5680;
  }
  .bk-logo-text {
    font-size: 1.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #fff5cc, #cfad56);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.06em;
  }
  .bk-tagline {
    color: #6b7e74;
    font-size: 0.88rem;
    letter-spacing: 0.05em;
  }

  .bk-card {
    width: 100%;
    max-width: 560px;
    background: linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%);
    backdrop-filter: blur(20px);
    border-radius: 28px;
    border: 1px solid rgba(207,173,86,0.18);
    box-shadow: 0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
    padding: 40px 36px;
  }

  .bk-section-title {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #cfad56;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .bk-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, rgba(207,173,86,0.25), transparent);
  }

  .bk-field { margin-bottom: 18px; }
  .bk-label {
    display: block;
    font-size: 0.78rem;
    font-weight: 600;
    color: #8b9e95;
    margin-bottom: 7px;
    letter-spacing: 0.03em;
  }
  .bk-label span { color: #cfad56; margin-left: 2px; }

  .bk-input, .bk-select, .bk-textarea {
    width: 100%;
    padding: 13px 16px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(0,0,0,0.35);
    color: #e8e0cd;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.93rem;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .bk-input::placeholder, .bk-textarea::placeholder { color: rgba(255,255,255,0.2); }
  .bk-input:focus, .bk-select:focus, .bk-textarea:focus {
    border-color: rgba(207,173,86,0.5);
    box-shadow: 0 0 0 3px rgba(207,173,86,0.08);
  }
  .bk-input.error { border-color: rgba(239,68,68,0.5); }
  .bk-input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(0.7) sepia(1) saturate(2) hue-rotate(5deg);
    cursor: pointer;
  }
  .bk-select { cursor: pointer; }
  .bk-select option { background: #112218; color: #e8e0cd; }
  .bk-textarea { min-height: 72px; resize: vertical; }

  .bk-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

  .bk-error-msg {
    font-size: 0.75rem;
    color: #f87171;
    margin-top: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .bk-guests-grid {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .bk-guest-btn {
    flex: 1;
    min-width: 44px;
    padding: 10px 6px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(0,0,0,0.3);
    color: #8b9e95;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s;
    text-align: center;
  }
  .bk-guest-btn.active {
    background: rgba(207,173,86,0.15);
    border-color: rgba(207,173,86,0.5);
    color: #cfad56;
  }
  .bk-guest-btn:hover:not(.active) {
    border-color: rgba(255,255,255,0.2);
    color: #e8e0cd;
  }
  .bk-guest-custom {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
  }
  .bk-guest-custom input {
    width: 70px;
    padding: 9px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.09);
    background: rgba(0,0,0,0.35);
    color: #e8e0cd;
    font-size: 0.9rem;
    outline: none;
    text-align: center;
  }
  .bk-guest-custom label { color: #6b7e74; font-size: 0.82rem; }

  .bk-alert-error {
    padding: 13px 16px;
    border-radius: 12px;
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.2);
    color: #f87171;
    font-size: 0.85rem;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bk-btn {
    width: 100%;
    padding: 16px;
    border-radius: 16px;
    border: none;
    background: linear-gradient(135deg, #d4b567, #cfad56, #b8943f);
    color: #05110a;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 1rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 4px 20px rgba(207,173,86,0.25);
  }
  .bk-btn:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(207,173,86,0.35);
  }
  .bk-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .bk-success-card {
    text-align: center;
    padding: 20px 0 10px;
  }
  .bk-success-icon {
    width: 80px; height: 80px;
    background: rgba(74,222,128,0.1);
    border: 2px solid rgba(74,222,128,0.3);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 2.2rem;
    margin: 0 auto 24px;
    animation: bk-pop 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes bk-pop {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }
  .bk-booking-summary {
    background: rgba(0,0,0,0.25);
    border: 1px solid rgba(207,173,86,0.15);
    border-radius: 16px;
    padding: 20px;
    margin: 20px 0 28px;
    text-align: left;
  }
  .bk-summary-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 6px 0;
    font-size: 0.88rem;
  }
  .bk-summary-row:not(:last-child) { border-bottom: 1px solid rgba(255,255,255,0.05); }
  .bk-summary-key { color: #6b7e74; min-width: 80px; }
  .bk-summary-val { color: #e8e0cd; font-weight: 500; }

  .bk-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(207,173,86,0.15), transparent);
    margin: 28px 0;
  }

  .bk-back-btn {
    background: none;
    border: none;
    color: #6b7e74;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 24px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: color 0.2s;
    padding: 0;
  }
  .bk-back-btn:hover { color: #cfad56; }

  .bk-user-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(207,173,86,0.08);
    border: 1px solid rgba(207,173,86,0.2);
    border-radius: 30px;
    padding: 5px 14px 5px 8px;
    margin-bottom: 28px;
    font-size: 0.82rem;
    color: #cfad56;
  }
  .bk-user-avatar {
    width: 26px; height: 26px;
    background: linear-gradient(135deg, #cfad56, #b8943f);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: #05110a;
    font-weight: 800;
    font-size: 0.7rem;
  }
`;

export default function BookingApp() {
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    bookingDate: '',
    bookingTime: '',
    guestCount: 2,
    notes: '',
    tableId: '',
  });
  const [availableTables, setAvailableTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [customer, setCustomer] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  // Preset guest count options
  const GUEST_PRESETS = [1, 2, 3, 4, 6, 8];

  useEffect(() => {
    const cust = getStoredCustomer();
    if (cust) {
      setCustomer(cust);
      setForm(prev => ({
        ...prev,
        customerName: cust.name || '',
        customerEmail: cust.email || '',
        customerPhone: cust.phone || '',
      }));
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/tables`)
      .then(r => r.json())
      .then(data => setAvailableTables(data.filter(t => t.active)))
      .catch(() => setAvailableTables([]));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.customerName.trim()) errs.customerName = 'Name is required';
    if (!form.bookingDate) errs.bookingDate = 'Please select a date';
    if (!form.bookingTime) errs.bookingTime = 'Please select a time slot';
    if (!form.guestCount || form.guestCount < 1) errs.guestCount = 'At least 1 guest required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    // Combine date + time into ISO string
    const dateTimeStr = `${form.bookingDate}T${form.bookingTime}:00`;
    const bookingTime = new Date(dateTimeStr).toISOString();

    const payload = {
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
      bookingTime,
      guestCount: parseInt(form.guestCount) || 2,
      notes: form.notes,
      status: 'CONFIRMED',
      table: form.tableId ? { id: parseInt(form.tableId) } : null,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        setBookingResult({
          name: form.customerName,
          date: form.bookingDate,
          time: TIME_SLOTS.find(s => s.value === form.bookingTime)?.label || form.bookingTime,
          guests: form.guestCount,
          email: form.customerEmail,
          table: availableTables.find(t => String(t.id) === String(form.tableId))?.tableNumber || 'Any',
          id: data.id || '',
        });
        setStep('success');
      } else {
        const err = await res.text();
        setServerError(err || 'Failed to create booking. Please try again.');
      }
    } catch {
      setServerError('Could not connect to server. Please check your connection.');
    }
    setLoading(false);
  };

  const resetForm = () => {
    const cust = getStoredCustomer();
    setForm({
      customerName: cust?.name || '',
      customerEmail: cust?.email || '',
      customerPhone: cust?.phone || '',
      bookingDate: '',
      bookingTime: '',
      guestCount: 2,
      notes: '',
      tableId: '',
    });
    setErrors({});
    setServerError('');
    setBookingResult(null);
    setStep('form');
  };

  if (step === 'success' && bookingResult) {
    return (
      <>
        <style>{css}</style>
        <div className="bk-page">
          <div className="bk-header">
            <div className="bk-logo">
              <div className="bk-logo-dot" />
              <span className="bk-logo-text">GatherPoint</span>
            </div>
          </div>
          <div className="bk-card">
            <div className="bk-success-card">
              <div className="bk-success-icon">🎉</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Booking Confirmed!</h2>
              <p style={{ color: '#6b7e74', fontSize: '0.9rem' }}>
                We look forward to welcoming you. See you soon!
              </p>

              <div className="bk-booking-summary">
                {bookingResult.id && (
                  <div className="bk-summary-row">
                    <span className="bk-summary-key">Booking #</span>
                    <span className="bk-summary-val" style={{ color: '#cfad56', fontWeight: 700 }}>
                      {bookingResult.id}
                    </span>
                  </div>
                )}
                <div className="bk-summary-row">
                  <span className="bk-summary-key">Guest</span>
                  <span className="bk-summary-val">{bookingResult.name}</span>
                </div>
                <div className="bk-summary-row">
                  <span className="bk-summary-key">Date</span>
                  <span className="bk-summary-val">
                    {new Date(bookingResult.date + 'T12:00:00').toLocaleDateString('en-IN', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="bk-summary-row">
                  <span className="bk-summary-key">Time</span>
                  <span className="bk-summary-val">{bookingResult.time}</span>
                </div>
                <div className="bk-summary-row">
                  <span className="bk-summary-key">Guests</span>
                  <span className="bk-summary-val">{bookingResult.guests} {bookingResult.guests === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="bk-summary-row">
                  <span className="bk-summary-key">Table</span>
                  <span className="bk-summary-val">{bookingResult.table}</span>
                </div>
                {bookingResult.email && (
                  <div className="bk-summary-row">
                    <span className="bk-summary-key">Email</span>
                    <span className="bk-summary-val">{bookingResult.email}</span>
                  </div>
                )}
              </div>

              <button className="bk-btn" onClick={resetForm}>
                Book Another Table
              </button>
              <button
                onClick={() => window.location.href = '/customer-login.html'}
                style={{ background: 'none', border: 'none', color: '#6b7e74', fontSize: '0.82rem', cursor: 'pointer', marginTop: '14px', display: 'block', width: '100%', fontFamily: 'inherit' }}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="bk-page">
        <div className="bk-header">
          <div className="bk-logo">
            <div className="bk-logo-dot" />
            <span className="bk-logo-text">GatherPoint</span>
          </div>
          <p className="bk-tagline">Reserve your table in seconds</p>
        </div>

        <div className="bk-card">
          {/* Back button */}
          <button className="bk-back-btn" onClick={() => window.location.href = '/customer-login.html'}>
            ← Back
          </button>

          {/* Logged-in user chip */}
          {customer && (
            <div className="bk-user-chip">
              <div className="bk-user-avatar">
                {customer.name?.charAt(0).toUpperCase() || 'G'}
              </div>
              Booking as {customer.name}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            {/* ── Contact Details ─────────────────────────── */}
            <div className="bk-section-title">Contact Details</div>

            <div className="bk-field">
              <label className="bk-label">Your Name <span>*</span></label>
              <input
                className={`bk-input${errors.customerName ? ' error' : ''}`}
                type="text"
                placeholder="Anshika Rai"
                value={form.customerName}
                onChange={e => { setForm({ ...form, customerName: e.target.value }); setErrors({ ...errors, customerName: '' }); }}
              />
              {errors.customerName && <div className="bk-error-msg">⚠ {errors.customerName}</div>}
            </div>

            <div className="bk-row">
              <div className="bk-field">
                <label className="bk-label">Email</label>
                <input
                  className="bk-input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.customerEmail}
                  onChange={e => setForm({ ...form, customerEmail: e.target.value })}
                />
              </div>
              <div className="bk-field">
                <label className="bk-label">Phone</label>
                <input
                  className="bk-input"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.customerPhone}
                  onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="bk-divider" />

            {/* ── Reservation Details ─────────────────────── */}
            <div className="bk-section-title">Reservation Details</div>

            {/* Date & Time — separate fields */}
            <div className="bk-row">
              <div className="bk-field">
                <label className="bk-label">Date <span>*</span></label>
                <input
                  className={`bk-input${errors.bookingDate ? ' error' : ''}`}
                  type="date"
                  min={todayStr()}
                  value={form.bookingDate}
                  onChange={e => { setForm({ ...form, bookingDate: e.target.value }); setErrors({ ...errors, bookingDate: '' }); }}
                />
                {errors.bookingDate && <div className="bk-error-msg">⚠ {errors.bookingDate}</div>}
              </div>

              <div className="bk-field">
                <label className="bk-label">Time Slot <span>*</span></label>
                <select
                  className={`bk-select${errors.bookingTime ? ' error' : ''}`}
                  value={form.bookingTime}
                  onChange={e => { setForm({ ...form, bookingTime: e.target.value }); setErrors({ ...errors, bookingTime: '' }); }}
                >
                  <option value="">Select time</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot.value} value={slot.value}>{slot.label}</option>
                  ))}
                </select>
                {errors.bookingTime && <div className="bk-error-msg">⚠ {errors.bookingTime}</div>}
              </div>
            </div>

            {/* Guest count */}
            <div className="bk-field">
              <label className="bk-label">Number of Guests <span>*</span></label>
              <div className="bk-guests-grid">
                {GUEST_PRESETS.map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`bk-guest-btn${form.guestCount === n ? ' active' : ''}`}
                    onClick={() => setForm({ ...form, guestCount: n })}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {!GUEST_PRESETS.includes(Number(form.guestCount)) && (
                <div className="bk-guest-custom">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={form.guestCount}
                    onChange={e => setForm({ ...form, guestCount: parseInt(e.target.value) || 1 })}
                  />
                  <label>Custom count</label>
                </div>
              )}
              <button
                type="button"
                onClick={() => setForm({ ...form, guestCount: 10 })}
                style={{ background: 'none', border: 'none', color: '#6b7e74', fontSize: '0.75rem', cursor: 'pointer', marginTop: '8px', padding: 0, fontFamily: 'inherit' }}
              >
                + More guests? Enter custom number
              </button>
            </div>

            {/* Table preference */}
            <div className="bk-field">
              <label className="bk-label">Preferred Table</label>
              <select
                className="bk-select"
                value={form.tableId}
                onChange={e => setForm({ ...form, tableId: e.target.value })}
              >
                <option value="">No preference (we'll assign one)</option>
                {availableTables.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.tableNumber} — {t.seats} seats
                    {t.floor ? ` · ${t.floor.name}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Special requests */}
            <div className="bk-field">
              <label className="bk-label">Special Requests</label>
              <textarea
                className="bk-textarea"
                placeholder="Birthday celebration, dietary requirements, seating preference…"
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            {serverError && (
              <div className="bk-alert-error">
                <span>⚠</span>
                {serverError}
              </div>
            )}

            <button type="submit" className="bk-btn" disabled={loading}>
              {loading ? '⏳ Confirming…' : '✓ Confirm Reservation'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
