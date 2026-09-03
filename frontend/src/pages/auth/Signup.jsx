import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/09-auth.css';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: '', surname: '', age: '', email: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await API.post('/auth/signup', form);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/verify-otp', { email: form.email, otp });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-logo">Car<span>Zone</span></div>
        <p className="auth-subtitle">{step === 1 ? 'Create your buyer account' : 'Verify your email'}</p>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleFormSubmit}>
            <div className="auth-row-2">
              <div className="auth-form-group">
                <label>First Name</label>
                <input name="firstName" className="auth-input" onChange={handleChange} required />
              </div>
              <div className="auth-form-group">
                <label>Surname</label>
                <input name="surname" className="auth-input" onChange={handleChange} required />
              </div>
            </div>
            <div className="auth-form-group">
              <label>Age</label>
              <input name="age" type="number" className="auth-input" onChange={handleChange} required />
            </div>
            <div className="auth-form-group">
              <label>Email</label>
              <input name="email" type="email" className="auth-input" onChange={handleChange} required />
            </div>
            <div className="auth-form-group">
              <label>Password</label>
              <input name="password" type="password" className="auth-input" onChange={handleChange} required />
            </div>
            <div className="auth-form-group">
              <label>Confirm Password</label>
              <input name="confirmPassword" type="password" className="auth-input" onChange={handleChange} required />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Please wait...' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className="auth-otp-note">
              We sent a 6-digit code to <strong>{form.email}</strong>
            </div>
            <div className="auth-form-group">
              <label>Enter OTP</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value)} className="auth-input" required />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}

        <p className="auth-footer-text">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}