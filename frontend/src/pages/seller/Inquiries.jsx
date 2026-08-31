import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/seller-style.css';

export default function Inquiries() {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'seller') {
            navigate('/login');
            return;
        }
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const res = await API.get('/inquiries/mine');
            setInquiries(res.data);
        } catch (err) {
            console.error('Failed to fetch inquiries', err);
        } finally {
            setLoading(false);
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
                    <Link to="/seller/inquiries" className="nav-item active"><span>Inquiries</span></Link>
                    <Link to="/seller/chat" className="nav-item"><span>Messages</span></Link>
                </nav>
                <div className="sidebar-section-title">SYSTEM</div>
                <nav className="nav-menu">
                    <Link to="/seller/profile" className="nav-item"><span>Settings</span></Link>
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
                        <h1>Inquiries</h1>
                        <p>Messages from interested buyers.</p>
                    </div>
                </header>

                <div className="content-card">
                    <div className="table-header">
                        <div><h2>All Inquiries</h2><p>Buyers who messaged you about your listings.</p></div>
                    </div>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr><th>Car</th><th>Buyer</th><th>Message</th><th>Date</th></tr>
                            </thead>
                            <tbody>
                                {loading && <tr><td colSpan="4">Loading...</td></tr>}
                                {!loading && inquiries.length === 0 && (
                                    <tr><td colSpan="4">No inquiries yet.</td></tr>
                                )}
                                {inquiries.map((inq) => (
                                    <tr key={inq._id}>
                                        <td>{inq.car?.makeModel || 'Deleted car'}</td>
                                        <td>{inq.buyer?.name} <br /><small style={{ color: '#94a3b8' }}>{inq.buyer?.email}</small></td>
                                        <td>{inq.message}</td>
                                        <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}