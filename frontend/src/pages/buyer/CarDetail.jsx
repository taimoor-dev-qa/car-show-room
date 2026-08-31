import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/01-base-header.css';
import '../../styles/02-hero-categories.css';
import '../../styles/03-featured-listings.css';
import '../../styles/04-car-card.css';
import '../../styles/05-stats-testimonials.css';
import '../../styles/06-cta-footer.css';
import '../../styles/07-car-detail.css';

const emojiMap = {
  Sedan: '🚗', SUV: '🚙', Hatchback: '🚘', Electric: '⚡', Luxury: '🏎️', 'Pickup Truck': '🛻',
};

export default function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCar();
  }, [id]);

  const fetchCar = async () => {
    try {
      const res = await API.get(`/cars/${id}`);
      setCar(res.data);
    } catch (err) {
      console.error('Failed to load car', err);
    }
  };

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      await API.post('/inquiries', { carId: id, message });
      setSent(true);
      setMessage('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  const startChat = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const res = await API.post('/conversations', { carId: id });
      navigate('/my-chats', { state: { conversationId: res.data._id } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start chat');
    }
  };

  if (!car) return <p style={{ padding: 40, textAlign: 'center' }}>Loading...</p>;

  const sellerName = car.seller?.businessName || car.seller?.name || 'Seller';

  return (
    <div className="car-detail-wrapper">
      <Link to="/" className="detail-back-btn">← Back to listings</Link>

      <div className="detail-image-wrap">
        {car.image ? (
          <img src={`http://localhost:3500/uploads/${car.image}`} alt={car.makeModel} />
        ) : (
          <div className="detail-image-placeholder">{emojiMap[car.category] || '🚗'}</div>
        )}
      </div>

      <div className="detail-title-row">
        <div>
          <h1>{car.makeModel}</h1>
          <p className="detail-subtitle">{car.year} · {car.category}</p>
        </div>
        <div className="detail-price-tag">Rs. {car.price.toLocaleString()}</div>
      </div>

      <div className="detail-meta-grid">
        <div className="detail-meta-card">
          <div className="detail-meta-icon">📅</div>
          <div className="detail-meta-label">Year</div>
          <div className="detail-meta-value">{car.year}</div>
        </div>
        <div className="detail-meta-card">
          <div className="detail-meta-icon">{emojiMap[car.category] || '🚗'}</div>
          <div className="detail-meta-label">Category</div>
          <div className="detail-meta-value">{car.category}</div>
        </div>
        <div className="detail-meta-card">
          <div className="detail-meta-icon">👁️</div>
          <div className="detail-meta-label">Views</div>
          <div className="detail-meta-value">{car.views}</div>
        </div>
        <div className="detail-meta-card">
          <div className="detail-meta-icon">✅</div>
          <div className="detail-meta-label">Status</div>
          <div className="detail-meta-value">{car.status}</div>
        </div>
      </div>

      <div className="detail-description-card">
        <h3>Description</h3>
        <p>{car.description || 'No description provided.'}</p>
      </div>

      <div className="detail-seller-strip">
        <div className="detail-seller-avatar">{sellerName.charAt(0).toUpperCase()}</div>
        <div>
          <strong>{sellerName}</strong>
          <small>Verified Seller</small>
        </div>
      </div>

      <hr className="detail-divider" />

      <div className="detail-message-card">
        <h3>Interested? Send a message to the seller</h3>

        {sent && <p className="detail-success-msg">Message sent! The seller will contact you soon.</p>}

        <form onSubmit={handleInquiry}>
          <textarea
            rows="3"
            placeholder="I'm interested in this car, is it still available?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <div className="detail-btn-row">
            <button type="button" className="detail-btn detail-btn-outline" onClick={startChat}>
              💬 Chat with Seller
            </button>
            <button type="submit" className="detail-btn detail-btn-primary">
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}