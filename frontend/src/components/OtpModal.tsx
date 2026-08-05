import React, { useState, useEffect } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://apparel-hunt-api.onrender.com').replace(/\/$/, '');

interface OtpModalProps {
  isOpen: boolean;
  email: string;
  onVerified: () => void;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export const OtpModal: React.FC<OtpModalProps> = ({ isOpen, email, onVerified, onClose }) => {
  const [otpCode, setOtpCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(60);

  useEffect(() => {
    let timer: any;
    if (isOpen && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, resendCooldown]);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMsg('يرجى إدخال رمز التحقق المكون من 6 أرقام / Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw data;

      onVerified();
    } catch (err: any) {
      setErrorMsg(err.message || 'رمز التحقق غير صحيح / Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw data;

      setResendCooldown(60);
      setErrorMsg('تم إعادة إرسال رمز التحقق بنجاح 📧 / Verification code resent!');
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل إرسال الرمز / Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '440px', padding: '32px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐 📧</div>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FEC949', marginBottom: '4px' }}>
          أدخل رمز التحقق
        </h2>
        <h3 style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
          Enter Verification Code
        </h3>

        <p style={{ fontSize: '12px', color: '#9BB1DB', marginBottom: '20px', lineHeight: 1.4 }}>
          تم إرسال رمز مكون من 6 أرقام إلى:<br />
          <strong style={{ color: '#FEC949' }}>{email}</strong>
        </p>

        <form onSubmit={handleVerify} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            className={`input-field ${errorMsg ? 'error' : ''}`}
            style={{
              textAlign: 'center',
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '8px',
              marginBottom: '16px',
              padding: '12px'
            }}
            placeholder="••••••"
            value={otpCode}
            onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
            required
          />

          {errorMsg && (
            <div style={{
              fontSize: '11.5px',
              color: errorMsg.includes('تم') ? '#8CE63D' : '#FFB8B8',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: '16px' }}>
            <span className="text-ar">{loading ? 'جاري التحقق...' : 'تأكيد ودخول'}</span>
            <span className="text-en">{loading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}</span>
          </button>
        </form>

        <div style={{ marginTop: '8px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading}
            style={{
              background: 'none',
              border: 'none',
              color: resendCooldown > 0 ? '#9BB1DB' : '#FEC949',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: resendCooldown > 0 ? 'default' : 'pointer',
              textDecoration: resendCooldown > 0 ? 'none' : 'underline'
            }}
          >
            {resendCooldown > 0 ? `إعادة الإرسال بعد ${resendCooldown} ثانية (${resendCooldown}s)` : 'إعادة إرسال الرمز / Resend Code'}
          </button>
          <span style={{ color: '#35589A' }}>•</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF5252',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            إلغاء / Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
