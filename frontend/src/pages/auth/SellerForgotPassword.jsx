import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import '../../styles/09-auth.css';

export default function SellerForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/auth/forgot-password', { email });
      navigate('/seller/reset-password', { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: 'center' }}>
          <span className="auth-seller-badge">SELLER PANEL</span>
        </div>
        <div className="auth-logo">Car<span>Zone</span></div>
        <p className="auth-subtitle">Enter your email to receive a reset code</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>Email</label>
            <input type="email" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="auth-btn">Send OTP</button>
        </form>
      </div>
    </div>
  );
}