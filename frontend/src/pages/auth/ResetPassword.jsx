import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import '../../styles/09-auth.css';

export default function ResetPassword() {
  const location = useLocation();
  const [email] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/auth/reset-password', { email, otp, newPassword, confirmPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-logo">Car<span>Zone</span></div>
        <p className="auth-subtitle">Set your new password</p>

        {error && <div className="auth-error">{error}</div>}

        {success ? (
          <div className="auth-success">Password reset! Redirecting to login...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label>Email</label>
              <input value={email} readOnly className="auth-input" />
            </div>
            <div className="auth-form-group">
              <label>OTP</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} className="auth-input" required />
            </div>
            <div className="auth-form-group">
              <label>New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="auth-input" required />
            </div>
            <div className="auth-form-group">
              <label>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="auth-input" required />
            </div>
            <button type="submit" className="auth-btn">Reset Password</button>
          </form>
        )}
      </div>
    </div>
  );
}