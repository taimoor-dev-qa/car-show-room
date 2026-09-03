import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/seller-style.css';
import '../../styles/10-rental.css';

export default function MyRentalCars() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => { try { const { data } = await API.get('/rentals/mine'); setRentals(data); } finally { setLoading(false); } };
  useEffect(() => { if (!user || user.role !== 'seller') navigate('/seller/login'); else load(); }, [navigate, user]);
  const remove = async (id) => { if (confirm('Delete this rental listing?')) { await API.delete(`/rentals/${id}`); load(); } };

  return <div className="app-layout">
    <aside className="sidebar"><div className="sidebar-brand"><div className="brand-icon">🚗</div><div className="brand-text"><h2>Car<span>Zone</span></h2><span>Seller Panel</span></div></div>
      <div className="sidebar-section-title">MAIN MENU</div><nav className="nav-menu"><Link to="/seller/dashboard" className="nav-item">Dashboard</Link><Link to="/seller/rental-cars" className="nav-item active">Rental Cars</Link><Link to="/seller/inquiries" className="nav-item">Inquiries</Link><Link to="/seller/chat" className="nav-item">Messages</Link></nav>
      <div className="sidebar-footer"><Link to="/" className="back-to-site">← Back to CarZone</Link><button onClick={logout} className="rental-logout">Logout</button></div>
    </aside>
    <main className="main-content"><header className="top-header"><div className="page-heading"><span className="page-eyebrow">RENTAL CARS</span><h1>My Rental Cars</h1><p>Manage rental vehicles separately from sale listings.</p></div><Link className="add-btn" to="/seller/rental-cars/add">+ Add Rental Car</Link></header>
      <div className="content-card table-container"><table><thead><tr><th>Car</th><th>City</th><th>Daily Rate</th><th>Availability</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        {loading && <tr><td colSpan="6">Loading...</td></tr>}{!loading && !rentals.length && <tr><td colSpan="6">No rental cars listed yet.</td></tr>}
        {rentals.map((rental) => <tr key={rental._id}><td>{rental.makeModel}{rental.variant ? ` ${rental.variant}` : ''}</td><td>{rental.city}</td><td>PKR {rental.dailyRate.toLocaleString()}/day</td><td>{new Date(rental.availableFrom).toLocaleDateString()} – {new Date(rental.availableUntil).toLocaleDateString()}</td><td><span className={`status-pill rental-status ${rental.status}`}>{rental.status}</span></td><td><button className="row-action-btn" onClick={() => navigate(`/seller/rental-cars/add?edit=${rental._id}`)}>Edit</button><button className="row-action-btn danger" onClick={() => remove(rental._id)}>Delete</button></td></tr>)}
      </tbody></table></div>
    </main>
  </div>;
}
