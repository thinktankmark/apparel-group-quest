import React, { useState } from 'react';
import { HeaderLogo } from '../components/HeaderLogo';
import { useAuth } from '../context/AuthContext';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPhoneError(null);
    setGeneralError(null);

    setLoading(true);
    try {
      // Direct Instant Registration (Email OTP Verification Disabled)
      await register(fullName, email, phoneNumber);
      onSignupSuccess();
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

  return (
    <div className="app-container">
      <HeaderLogo />

      {/* Title */}
      <h1 className="title-ar">مغامرة البحث عن الكنز!</h1>
      <h2 className="subtitle-en">Step into the treasure hunt!</h2>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px', direction: 'ltr' }}>
        <div className="input-group">
          <label className="input-label"> Full Name/ الاسم الكامل</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter full name / أدخل اسمك الكامل"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label className="input-label">Email Address / البريد الإلكتروني</label>
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
          <label className="input-label">Phone Number / رقم الهاتف</label>
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
          <span className="text-ar">{loading ? 'جاري التسجيل...' : 'الانضمام إلى المغامرة'}</span>
          <span className="text-en">{loading ? 'REGISTERING...' : 'JOIN THE ADVENTURE'}</span>
        </button>
      </form>

      {/* Switch to Login */}
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <p style={{ fontSize: '12px', color: '#9BB1DB' }}>
          لديك حساب؟{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onGoToLogin();
            }}
            style={{ background: 'none', border: 'none', color: '#FEC949', textDecoration: 'underline', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}
          >
            سجّل الدخول
          </button>
        </p>
        <p style={{ fontSize: '12px', color: '#9BB1DB' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onGoToLogin();
            }}
            style={{ background: 'none', border: 'none', color: '#FEC949', textDecoration: 'underline', fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}
          >
           Log in
          </button>
        </p>
      </div>
    </div>
  );
};
