import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/seller-style.css';

export default function Profile() {
  const [form, setForm] = useState({ name: '', businessName: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      setForm({ name: res.data.name, businessName: res.data.businessName || '', password: '', confirmPassword: '' });
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const payload = { name: form.name, businessName: form.businessName };
      if (form.password) payload.password = form.password;

      await API.put('/auth/profile', payload);
      setMessage('Profile updated successfully!');
      setForm({ ...form, password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🚗</div>
          <div className="brand-text"><h2>Car<span>Zone</span></h2><span>Seller Panel</span></div>
        </div>
        <div className="sidebar-section-title">MAIN MENU</div>
        <nav className="nav-menu">
          <Link to="/seller/dashboard" className="nav-item"><span>Dashboard</span></Link>
          <Link to="/seller/rental-cars" className="nav-item"><span>Rental Cars</span></Link>
          <Link to="/seller/rental-requests" className="nav-item"><span>Rental Requests</span></Link>
          <Link to="/seller/inquiries" className="nav-item"><span>Inquiries</span></Link>
          <Link to="/seller/chat" className="nav-item"><span>Messages</span></Link>
        </nav>
        <div className="sidebar-section-title">SYSTEM</div>
        <nav className="nav-menu">
          <Link to="/seller/profile" className="nav-item active"><span>Settings</span></Link>
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="back-to-site">← Back to CarZone</Link>
          <a onClick={logout} className="back-to-site" style={{ cursor: 'pointer' }}>Logout</a>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="page-heading">
            <span className="page-eyebrow">SELLER PANEL</span>
            <h1>Settings</h1>
            <p>Update your account information.</p>
          </div>
        </header>

        <div className="content-card" style={{ padding: 24, maxWidth: 460 }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Business Name</label>
              <input name="businessName" value={form.businessName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>New Password (leave blank to keep current)</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
            <button type="submit" className="submit-btn">Save Changes</button>
          </form>
        </div>
      </main>
    </div>
  );
}
