import React, { useState } from 'react';
import { HeaderLogo } from '../components/HeaderLogo';
import { OtpModal } from '../components/OtpModal';
import { useAuth } from '../context/AuthContext';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://apparel-hunt-api.onrender.com').replace(/\/$/, '');

interface SignupPageProps {
  onSignupSuccess: () => void;
  onGoToLogin: () => void;
  lang?: string;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSignupSuccess, onGoToLogin }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPhoneError(null);
    setGeneralError(null);

    setLoading(true);
    try {
      // Step 1: Send 6-Digit Email OTP
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw data;

      // Open 6-digit OTP Modal
      setShowOtpModal(true);
    } catch (err: any) {
      if (err.error === 'EMAIL_ALREADY_EXISTS') {
        setEmailError('⚠️ البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول. / Email address is already registered.');
      } else if (err.error === 'PHONE_ALREADY_EXISTS') {
        setPhoneError('⚠️ رقم الهاتف مسجل بالفعل. يرجى تسجيل الدخول. / Phone number is already registered.');
      } else if (err.error === 'MAIN_BOOTH_REQUIRED') {
        setGeneralError('📍 يجب التسجيل من جناح المعرض الرئيسي أولاً. / Must register from main booth first.');
      } else {
        setGeneralError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = async () => {
    setShowOtpModal(false);
    setLoading(true);
    try {
      // Step 2: Complete Player Account Registration after OTP Verification
      await register(fullName, email, phoneNumber);
      onSignupSuccess();
    } catch (err: any) {
      setGeneralError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <HeaderLogo />

      {/* Title */}
      <h1 className="title-ar">رحلة البحث عن الكنز — سجل معلوماتك لتنضم إلى المغامرة!</h1>
      <h2 className="subtitle-en">Apparel Scavenger Hunt — Register to join the adventure!</h2>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px' }}>
        <div className="input-group">
          <label className="input-label">الاسم الكامل / Full Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="أدخل اسمك الكامل / Enter full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">البريد الإلكتروني / Email Address</label>
          <input
            type="email"
            className={`input-field ${emailError ? 'error' : ''}`}
            placeholder="example@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {emailError && <span style={{ fontSize: '11px', color: '#FF5252', marginTop: '4px' }}>{emailError}</span>}
        </div>

        <div className="input-group">
          <label className="input-label">رقم الهاتف / Phone Number</label>
          <input
            type="tel"
            className={`input-field ${phoneError ? 'error' : ''}`}
            placeholder="+966 50 000 0000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          {phoneError && <span style={{ fontSize: '11px', color: '#FF5252', marginTop: '4px' }}>{phoneError}</span>}
        </div>

        {generalError && (
          <div style={{ background: 'rgba(220,53,69,0.2)', border: '1px solid #FF5252', color: '#FFB8B8', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', marginBottom: '16px', textAlign: 'center' }}>
            {generalError}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: '16px' }}>
          <span className="text-ar">{loading ? 'جاري إرسال رمز التحقق...' : 'إرسال رمز التحقق والتسجيل'}</span>
          <span className="text-en">{loading ? 'SENDING OTP CODE...' : 'SEND OTP CODE & REGISTER'}</span>
        </button>
      </form>

      {/* Switch to Login */}
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <p style={{ fontSize: '12px', color: '#9BB1DB' }}>
          لديك حساب بالفعل؟ / Already have an account?{' '}
          <button
            onClick={onGoToLogin}
            style={{ background: 'none', border: 'none', color: '#FEC949', textDecoration: 'underline', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}
          >
            سجّل الدخول / Log in
          </button>
        </p>
      </div>

      {/* 6-Digit Email OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        email={email}
        onVerified={handleOtpVerified}
        onClose={() => setShowOtpModal(false)}
        lang="ar"
      />
    </div>
  );
};
