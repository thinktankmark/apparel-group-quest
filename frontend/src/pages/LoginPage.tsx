import React, { useState } from 'react';
import { HeaderLogo } from '../components/HeaderLogo';
import { MainBoothModal } from '../components/MainBoothModal';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onLoginSuccess: (currentSequenceOrder?: number) => void;
  onGoToSignup: () => void;
  lang: 'ar' | 'en';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onGoToSignup }) => {
  const { login, mainBoothToken } = useAuth();
  const [credential, setCredential] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showBoothModal, setShowBoothModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credential.trim()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await login(credential);
      const seqOrder = data?.progress?.currentSequenceOrder || 1;
      onLoginSuccess(seqOrder);
    } catch (err: any) {
      if (err.error === 'ACCOUNT_NOT_FOUND' || err.showBoothPopup) {
        setErrorMsg(
          <>
            <span dir="rtl" style={{ display: 'block', color: '#ffffff', fontWeight:'400' }}>
              ⚠️ الحساب غير موجود. يرجى التحقق من الرقم أو البريد الإلكتروني.
            </span>
            <span dir="ltr" style={{ display: 'block', fontWeight:'400' }}>
              ⚠️ Account doesn't exist. Please check your number or email.
            </span>
          </>
        );
      } else {
        setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpClick = () => {
    if (!mainBoothToken) {
      setShowBoothModal(true);
    } else {
      onGoToSignup();
    }
  };

  return (
    <div className="app-container">
      <HeaderLogo />

      <h1 className="title-ar" style={{ fontSize: '18px', marginBottom: '4px' }}>
        لقد كشفت عن دليل / You found a clue!
      </h1>
      <h2 style={{ fontSize: '13px', color: '#FFFFFF', textAlign: 'center', marginBottom: '24px' }}>
        سجّل الدخول برقم هاتفك أو بريدك الإلكتروني لتبدأ التحدّي الآن<br />
        <span style={{ fontSize: '12px', color: '#9BB1DB', direction: 'ltr', unicodeBidi: 'isolate', display: 'inline-block', marginTop: '2px' }}>
          Login with your phone number or email to play the challenge.
        </span>
      </h2>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="input-group">
          <label className="input-label">
            رقم الهاتف أو البريد الإلكتروني / Phone Number or Email
          </label>
          <input
            type="text"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            className={`input-field ${errorMsg ? 'error' : ''}`}
            placeholder="أدخل رقم الهاتف أو البريد / Enter phone or email"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </div>

        {errorMsg && (
          <div className="error-banner" style={{
            width: '100%',
            background: 'rgba(220, 53, 69, 0.25)',
            border: '1.5px solid #FF5252',
            borderRadius: '12px',
            padding: '12px 14px',
            color: '#FFB8B8',
            fontSize: '12px',
            fontWeight: 600,
            textAlign: 'center',
            marginBottom: '16px',
            lineHeight: 1.4
          }}>
            {errorMsg}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginBottom: '20px' }}>
          <span className="text-ar">{loading ? 'جاري الدخول...' : 'تسجيل الدخول'}</span>
          <span className="text-en">{loading ? 'LOGGING IN...' : 'LOG IN'}</span>
        </button>
      </form>

      {/* Footer Link to Signup */}
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <p style={{ fontSize: '11.5px', color: '#9BB1DB' }}>
          ليس لديك حساب؟{' '}
          <button
            onClick={handleSignUpClick}
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
            سجّل هنا
          </button>
        </p>
        <p style={{ fontSize: '11.5px', direction: 'ltr', color: '#9BB1DB' }}>
          Don't have an account?{' '}
          <button
            onClick={handleSignUpClick}
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
           Sign up here
          </button>
        </p>
      </div>

      {/* Main Booth Popup Modal */}
      <MainBoothModal
        isOpen={showBoothModal}
        onClose={() => setShowBoothModal(false)}
        lang="ar"
      />
    </div>
  );
};
