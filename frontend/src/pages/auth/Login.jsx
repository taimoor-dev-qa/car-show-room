import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/09-auth.css';

export default function Login() {
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
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-logo">Car<span>Zone</span></div>
        <p className="auth-subtitle">Welcome back, login to continue</p>

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

        <p className="auth-footer-text"><Link to="/forgot-password">Forgot password?</Link></p>
        <p className="auth-footer-text">New here? <Link to="/signup">Sign up</Link></p>
      </div>
    </div>
  );
}