import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import CarDetailMeta from '../../components/CarDetailMeta';
import '../../styles/01-base-header.css';
import '../../styles/02-hero-categories.css';
import '../../styles/03-featured-listings.css';
import '../../styles/04-car-card.css';
import '../../styles/05-stats-testimonials.css';
import '../../styles/06-cta-footer.css';
import '../../styles/07-car-detail.css';

const emojiMap = { Sedan: 'Car', SUV: 'SUV', Hatchback: 'Car', Electric: 'EV', Luxury: 'Car', 'Pickup Truck': 'Truck' };

export default function CarDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => { API.get(`/cars/${id}`).then(({ data }) => { setCar(data); setActiveImage(0); }).catch(() => setCar(false)); }, [id]);
  const requireUser = () => { if (!user) { navigate('/login'); return false; } return true; };
  const sendInquiry = async (event) => {
    event.preventDefault(); if (!requireUser()) return;
    try { await API.post('/inquiries', { carId: id, message }); setSent(true); setMessage(''); }
    catch (err) { alert(err.response?.data?.message || 'Failed to send message'); }
  };
  const startChat = async () => {
    if (!requireUser()) return;
    try { const { data } = await API.post('/conversations', { carId: id }); navigate('/my-chats', { state: { conversationId: data._id } }); }
    catch (err) { alert(err.response?.data?.message || 'Failed to start chat'); }
  };
  if (car === null) return <p className="detail-loading">Loading...</p>;
  if (!car) return <p className="detail-loading">Car not found.</p>;
  const sellerName = car.seller?.businessName || car.seller?.name || 'Seller';
  const images = car.images?.length ? car.images : car.image ? [car.image] : [];

  return <div className="car-detail-wrapper"><Link to="/" className="detail-back-btn">Back to listings</Link><div className="detail-image-wrap">{images.length ? <img src={`http://localhost:3500/uploads/${images[activeImage]}`} alt={car.makeModel} /> : <div className="detail-image-placeholder">{emojiMap[car.category] || 'Car'}</div>}</div>{images.length > 1 && <div className="detail-thumbnail-row">{images.map((image, index) => <img key={image} src={`http://localhost:3500/uploads/${image}`} onClick={() => setActiveImage(index)} className={`detail-thumbnail ${activeImage === index ? 'active' : ''}`} alt={`${car.makeModel} ${index + 1}`} />)}</div>}
    <div className="detail-title-row"><div><h1>{car.makeModel}{car.variant ? ` ${car.variant}` : ''}</h1><p className="detail-subtitle">{car.year} · {car.category}</p>{car.isNegotiable && <span className="detail-negotiable-badge">Negotiable</span>}</div><div className="detail-price-tag">Rs. {car.price.toLocaleString()}</div></div>
    <CarDetailMeta car={car} /><section className="detail-description-card"><h3>Description</h3><p>{car.description || 'No description provided.'}</p>{car.hasAccidentHistory && <p className="detail-accident-note"><strong>Accident history:</strong> {car.accidentNotes || 'Reported by seller.'}</p>}</section>
    <div className="detail-seller-strip"><div className="detail-seller-avatar">{sellerName.charAt(0).toUpperCase()}</div><div><strong>{sellerName}</strong><small>Verified Seller</small></div></div><hr className="detail-divider" />
    <section className="detail-message-card"><h3>Interested? Send a message to the seller</h3>{sent && <p className="detail-success-msg">Message sent! The seller will contact you soon.</p>}<form onSubmit={sendInquiry}><textarea rows="3" placeholder="I'm interested in this car, is it still available?" value={message} onChange={(event) => setMessage(event.target.value)} required /><div className="detail-btn-row"><button type="button" className="detail-btn detail-btn-outline" onClick={startChat}>Chat with Seller</button><button type="submit" className="detail-btn detail-btn-primary">Send Message</button></div></form></section>
  </div>;
}
