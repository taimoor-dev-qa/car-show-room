import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/09-auth.css';

export default function SellerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.user.role !== 'seller') {
        setError('This account is not a seller account');
        return;
      }
      login(res.data.user, res.data.token);
      navigate('/seller/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div style={{ textAlign: 'center' }}>
          <span className="auth-seller-badge">SELLER PANEL</span>
        </div>
        <div className="auth-logo">Car<span>Zone</span></div>
        <p className="auth-subtitle">Login to manage your listings</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label>Email</label>
            <input type="email" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="auth-form-group">
            <label>Password</label>
            <input type="password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="auth-btn">Login</button>
        </form>

        <p className="auth-footer-text"><Link to="/seller/forgot-password">Forgot password?</Link></p>
      </div>
    </div>
  );
}