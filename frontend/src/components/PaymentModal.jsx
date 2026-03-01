import React, { useState, useEffect } from 'react';
import { payOrder } from '../services/api';
import { FaCreditCard, FaMobileAlt, FaCheckCircle, FaLock, FaReceipt, FaTimes } from 'react-icons/fa';


const STEPS = { FORM: 'form', PROCESSING: 'processing', SUCCESS: 'success' };

const PaymentModal = ({ show, onClose, orderId, total, paymentMethod, orderItems, deliveryAddress }) => {
  const [step, setStep] = useState(STEPS.FORM);
  const [error, setError] = useState('');

  // Card fields
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // UPI field
  const [upiId, setUpiId] = useState('');

  const [paidOrder, setPaidOrder] = useState(null);

  useEffect(() => {
    if (show) {
      setStep(STEPS.FORM);
      setError('');
      setCardName(''); setCardNumber(''); setExpiry(''); setCvv(''); setUpiId('');
      setPaidOrder(null);
    }
  }, [show, orderId]);

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const validate = () => {
    if (paymentMethod === 'card') {
      if (!cardName.trim()) return 'Enter cardholder name';
      const rawCard = cardNumber.replace(/\s/g, '');
      if (rawCard.length !== 16) return 'Card number must be 16 digits';
      if (expiry.length < 5) return 'Enter valid expiry (MM/YY)';
      const [mm] = expiry.split('/');
      if (parseInt(mm) < 1 || parseInt(mm) > 12) return 'Invalid expiry month';
      if (cvv.length < 3) return 'CVV must be 3-4 digits';
    } else {
      if (!upiId.trim()) return 'Enter UPI ID';
      if (!upiId.includes('@')) return 'UPI ID must contain @ (e.g. name@upi)';
    }
    return null;
  };

  const handlePay = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setStep(STEPS.PROCESSING);
    try {
      // Simulate network delay for realism
      await new Promise((res) => setTimeout(res, 2200));
      const { data } = await payOrder(orderId);
      setPaidOrder(data.order);
      setStep(STEPS.SUCCESS);
    } catch (e) {
      setStep(STEPS.FORM);
      setError(e.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  if (!show) return null;



  return (
    <div
      className="modal-backdrop-custom"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="payment-modal-box"
        style={{
          background: '#fff', borderRadius: 20, width: '100%', maxWidth: 460,
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)', overflow: 'hidden', position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)', padding: '1.25rem 1.5rem', color: '#fff' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <FaLock size={14} />
              <span className="fw-bold" style={{ fontSize: '1rem' }}>Secure Payment</span>
            </div>
            {step !== STEPS.PROCESSING && (
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18 }}>
                <FaTimes />
              </button>
            )}
          </div>
          <div style={{ marginTop: 4, opacity: 0.85, fontSize: '0.8rem' }}>
            Order #{orderId} &nbsp;|&nbsp; Amount: <strong>₹{parseFloat(total).toFixed(0)}</strong>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>

          {/* ─── STEP 1: FORM ─── */}
          {step === STEPS.FORM && (
            <>
              {/* Payment method tabs */}
              <div className="d-flex gap-2 mb-4">
                <div
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: 12, textAlign: 'center', cursor: 'default',
                    border: '2px solid #e63946', background: '#fff5f5',
                  }}
                >
                  {paymentMethod === 'card' ? (
                    <><FaCreditCard className="text-danger" size={22} /><div className="fw-bold small mt-1 text-danger">Debit / Credit Card</div></>
                  ) : (
                    <><FaMobileAlt className="text-danger" size={22} /><div className="fw-bold small mt-1 text-danger">UPI Payment</div></>
                  )}
                </div>
              </div>

              {/* CARD FORM */}
              {paymentMethod === 'card' && (
                <>
                  {/* Card preview */}
                  <div style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    color: '#fff', borderRadius: 14, padding: '1.2rem 1.4rem', marginBottom: '1.25rem',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', right: 16, top: 14, opacity: 0.6 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#eb5757', display: 'inline-block' }} />
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f9ca24', display: 'inline-block', marginLeft: -12 }} />
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: 8 }}>CARD NUMBER</div>
                    <div style={{ letterSpacing: '0.2em', fontSize: '1.05rem', fontFamily: 'monospace', marginBottom: 16 }}>
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>
                    <div className="d-flex justify-content-between align-items-end">
                      <div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>CARD HOLDER</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cardName || 'YOUR NAME'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>EXPIRES</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{expiry || 'MM/YY'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Cardholder Name</label>
                    <input className="form-control" placeholder="Name as on card" value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())} autoComplete="cc-name" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Card Number</label>
                    <input className="form-control" placeholder="1234 5678 9012 3456" value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19} autoComplete="cc-number" inputMode="numeric" />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Expiry Date</label>
                      <input className="form-control" placeholder="MM/YY" value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        maxLength={5} autoComplete="cc-exp" inputMode="numeric" />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold small">CVV</label>
                      <input className="form-control" placeholder="•••" type="password" value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4} autoComplete="cc-csc" inputMode="numeric" />
                    </div>
                  </div>
                </>
              )}

              {/* UPI FORM */}
              {paymentMethod === 'online' && (
                <>
                  <div style={{
                    background: '#f0f9ff', border: '1px dashed #0ea5e9', borderRadius: 12,
                    padding: '1.2rem', marginBottom: '1.25rem', textAlign: 'center',
                  }}>
                    <FaMobileAlt size={36} className="text-info mb-2" />
                    <div className="fw-bold">Pay using UPI</div>
                    <div className="text-muted small">Enter your UPI ID to complete payment</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">UPI ID</label>
                    <input className="form-control form-control-lg" placeholder="e.g. yourname@upi"
                      value={upiId} onChange={(e) => setUpiId(e.target.value.trim())} autoComplete="off" />
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                      Supported: @paytm, @gpay, @phonepe, @ybl, @okaxis, @upi, etc.
                    </div>
                  </div>
                  <div className="d-flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
                    {['@paytm', '@gpay', '@phonepe', '@okaxis'].map((suffix) => (
                      <button key={suffix} className="btn btn-outline-secondary btn-sm rounded-pill"
                        onClick={() => setUpiId((prev) => prev.split('@')[0] + suffix)}
                        style={{ fontSize: '0.72rem' }}
                      >{suffix}</button>
                    ))}
                  </div>
                </>
              )}

              {error && (
                <div className="alert alert-danger py-2 small" style={{ borderRadius: 10 }}>{error}</div>
              )}

              <button
                className="btn btn-danger w-100 py-3 fw-bold rounded-pill"
                style={{ fontSize: '1rem', letterSpacing: '0.03em' }}
                onClick={handlePay}
              >
                <FaLock size={13} className="me-2" />
                Pay ₹{parseFloat(total).toFixed(0)} Now
              </button>
              <div className="text-center mt-2" style={{ fontSize: '0.72rem', color: '#999' }}>
                🔒 256-bit SSL encrypted &nbsp;|&nbsp; Your data is safe
              </div>
            </>
          )}

          {/* ─── STEP 2: PROCESSING ─── */}
          {step === STEPS.PROCESSING && (
            <div className="text-center py-4">
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.5rem' }}>
                <div className="spinner-border text-danger" style={{ width: 64, height: 64 }} role="status" />
                <FaCreditCard
                  style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#e63946' }}
                  size={24}
                />
              </div>
              <h5 className="fw-bold mb-1">Processing Payment…</h5>
              <p className="text-muted small mb-0">Please wait, do not close this window</p>
              <div className="mt-3 d-flex justify-content-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#e63946',
                    animation: `bounce 1.2s ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
              <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }`}</style>
            </div>
          )}

          {/* ─── STEP 3: SUCCESS RECEIPT ─── */}
          {step === STEPS.SUCCESS && paidOrder && (
            <div>
              <div className="text-center mb-4">
                <div style={{
                  width: 72, height: 72, borderRadius: '50%', background: '#d4edda',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                  animation: 'popIn 0.4s ease',
                }}>
                  <FaCheckCircle size={38} color="#28a745" />
                </div>
                <h5 className="fw-bold text-success mb-1">Payment Successful!</h5>
                <p className="text-muted small mb-0">Your order has been confirmed</p>
                <style>{`@keyframes popIn { 0%{transform:scale(0)} 70%{transform:scale(1.15)} 100%{transform:scale(1)} }`}</style>
              </div>

              {/* Receipt Card */}
              <div style={{ background: '#f8f9fa', borderRadius: 14, padding: '1.1rem', marginBottom: '1rem', border: '1px solid #e9ecef' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FaReceipt className="text-danger" />
                  <span className="fw-bold">Payment Receipt</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Order ID</span>
                  <span className="fw-bold">#{paidOrder.id}</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Date & Time</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Payment Method</span>
                  <span className="text-capitalize">{paymentMethod === 'card' ? `💳 Card (••••${cardNumber.replace(/\s/g, '').slice(-4)})` : `📱 UPI (${upiId})`}</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span className="text-muted">Payment Status</span>
                  <span className="badge bg-success rounded-pill">✓ Paid</span>
                </div>
                <hr style={{ margin: '0.7rem 0' }} />
                {/* Items */}
                {paidOrder.items?.map((item, i) => (
                  <div key={i} className="d-flex justify-content-between small mb-1">
                    <span>{item.food_name} × {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
                <hr style={{ margin: '0.7rem 0' }} />
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total Paid</span>
                  <span className="text-danger fs-6">₹{parseFloat(paidOrder.total_amount).toFixed(0)}</span>
                </div>
                {deliveryAddress && (
                  <div className="mt-2 small text-muted">
                    <span>📍 {deliveryAddress}</span>
                  </div>
                )}
              </div>

              <div style={{ background: '#fff3cd', borderRadius: 10, padding: '0.65rem 1rem', fontSize: '0.8rem', color: '#856404', marginBottom: '1rem' }}>
                🚴 Your order is confirmed and being prepared. Expected delivery in <strong>30–45 mins</strong>.
              </div>

              <button
                className="btn btn-danger w-100 rounded-pill py-2 fw-bold"
                onClick={onClose}
              >
                View My Orders
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
