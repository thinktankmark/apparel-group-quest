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

      <h1 className="title-ar" style={{ fontSize: '18px', marginBottom: '4px' }}>
        أنشئ حسابك لبدء البحث عن الكنز
      </h1>
      <h2 className="subtitle-en" style={{ fontSize: '13.5px', marginBottom: '20px' }}>
        Create your account to start the Treasure Hunt
      </h2>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Full Name */}
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

        {/* Email */}
        <div className="input-group">
          <label className="input-label">البريد الإلكتروني / Email Address</label>
          <input
            type="email"
            className={`input-field ${emailError ? 'error' : ''}`}
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {emailError && <div className="error-banner">{emailError}</div>}

        {/* Phone */}
        <div className="input-group">
          <label className="input-label">رقم الهاتف / Phone Number</label>
          <input
            type="tel"
            className={`input-field ${phoneError ? 'error' : ''}`}
            placeholder="+966 5X XXX XXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        {phoneError && <div className="error-banner">{phoneError}</div>}

        {generalError && <div className="error-banner">{generalError}</div>}

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px', marginBottom: '16px' }}>
          <span className="text-ar">{loading ? 'جاري الإنشاء...' : 'إنشاء حساب جديد'}</span>
          <span className="text-en">{loading ? 'CREATING...' : 'CREATE ACCOUNT'}</span>
        </button>
      </form>

      {/* Footer Link to Login */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '11.5px', color: '#9BB1DB' }}>
          لديك حساب بالفعل؟ / Already have an account?{' '}
          <button
            onClick={onGoToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#FEC949',
              textDecoration: 'underline',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '11.5px'
            }}
          >
            سجّل الدخول هنا / Log in here
          </button>
        </p>
      </div>
    </div>
  );
};
