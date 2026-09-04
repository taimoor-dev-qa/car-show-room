import { Fragment, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import RentalRequestDetails from '../../components/RentalRequestDetails';
import '../../styles/seller-style.css';
import '../../styles/10-rental.css';

const dateText = (date) => new Date(date).toLocaleDateString();

export default function RentalRequests() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    try { const { data } = await API.get('/rental-requests/seller'); setRequests(data); }
    catch (err) { setError(err.response?.data?.message || 'Unable to load rental requests.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (!user || user.role !== 'seller') navigate('/seller/login'); else load(); }, [navigate, user]);
  const updateStatus = async (id, status) => {
    try { await API.patch(`/rental-requests/${id}/status`, { status }); setDetail(null); load(); }
    catch (err) { setError(err.response?.data?.message || 'Could not update request.'); }
  };
  const viewDetails = async (id) => {
    if (detail?._id === id) return setDetail(null);
    try { const { data } = await API.get(`/rental-requests/seller/${id}`); setDetail(data); }
    catch (err) { setError(err.response?.data?.message || 'Unable to load request details.'); }
  };

  return <div className="app-layout"><aside className="sidebar"><div className="sidebar-brand"><div className="brand-icon">Car</div><div className="brand-text"><h2>Car<span>Zone</span></h2><span>Seller Panel</span></div></div><div className="sidebar-section-title">MAIN MENU</div><nav className="nav-menu"><Link to="/seller/dashboard" className="nav-item">Dashboard</Link><Link to="/seller/rental-cars" className="nav-item">Rental Cars</Link><Link to="/seller/rental-requests" className="nav-item active">Rental Requests</Link><Link to="/seller/inquiries" className="nav-item">Inquiries</Link><Link to="/seller/chat" className="nav-item">Messages</Link></nav><div className="sidebar-footer"><Link to="/" className="back-to-site">Back to CarZone</Link><button onClick={logout} className="rental-logout">Logout</button></div></aside>
    <main className="main-content"><header className="top-header"><div className="page-heading"><span className="page-eyebrow">RENTAL REQUESTS</span><h1>Incoming Rental Requests</h1><p>Review requests from buyers for your rental cars.</p></div></header>{error && <p className="rental-error">{error}</p>}<div className="content-card table-container"><table><thead><tr><th>Buyer</th><th>Car / Purpose</th><th>Dates</th><th>Estimated Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {loading && <tr><td colSpan="6">Loading...</td></tr>}{!loading && !requests.length && <tr><td colSpan="6">No rental requests yet.</td></tr>}
      {requests.map((request) => <Fragment key={request._id}><tr><td>{request.buyer?.name || 'Buyer'}<br /><small>{request.buyer?.email}<br />{request.contactPhone}</small></td><td>{request.rentalCar?.makeModel || 'Rental car unavailable'}<br /><small>{request.rentalPurpose} - {request.passengerCount} passengers</small></td><td>{dateText(request.startDate)} - {dateText(request.endDate)}<br /><small>{request.totalDays} days</small></td><td>PKR {request.estimatedTotal.toLocaleString()}</td><td><span className={`status-pill rental-request-status ${request.status}`}>{request.status}</span></td><td><button type="button" className="row-action-btn" onClick={() => viewDetails(request._id)}>{detail?._id === request._id ? 'Hide Details' : 'Details'}</button>{request.status === 'pending' && <><button className="row-action-btn" onClick={() => updateStatus(request._id, 'accepted')}>Accept</button><button className="row-action-btn danger" onClick={() => updateStatus(request._id, 'rejected')}>Reject</button></>}</td></tr>{detail?._id === request._id && <tr className="request-detail-row"><td colSpan="6"><RentalRequestDetails request={detail} sellerView /></td></tr>}</Fragment>)}
    </tbody></table></div></main></div>;
}
