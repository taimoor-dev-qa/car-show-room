import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/buyer-style.css';

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
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await API.post('/inquiries', { carId: id, message });
            setSent(true);
            setMessage('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send message');
        }
    };
    const startChat = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            const res = await API.post('/conversations', { carId: id });
            navigate('/my-chats', { state: { conversationId: res.data._id } });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to start chat');
        }
    };

    if (!car) return <p style={{ padding: 40 }}>Loading...</p>;

    return (
        <div style={{ maxWidth: 700, margin: '40px auto', padding: 20 }}>
            {car.image && (
                <img
                    src={`http://localhost:3500/uploads/${car.image}`}
                    alt={car.makeModel}
                    style={{ width: '100%', maxHeight: 350, objectFit: 'cover', borderRadius: 12, marginBottom: 20 }}
                />
            )}
            <h1>{car.makeModel}</h1>
            <h1>{car.makeModel}</h1>
            <p style={{ color: '#64748b' }}>{car.year} · {car.category}</p>
            <div className="car-price" style={{ padding: '10px 0' }}>Rs. {car.price.toLocaleString()}</div>
            <p>{car.description}</p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>👁 {car.views} views</p>
            <p style={{ fontSize: 13 }}>Seller: {car.seller?.businessName || car.seller?.name}</p>

            <hr style={{ margin: '24px 0' }} />

            <h3>Interested? Send a message to the seller</h3>
            {sent ? (
                <p style={{ color: 'green' }}>Message sent! The seller will contact you soon.</p>
            ) : (
                <form onSubmit={handleInquiry}>
                    <textarea
                        rows="3"
                        placeholder="I'm interested in this car, is it still available?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        style={{ width: '100%', padding: 10, marginBottom: 10 }}
                    />
                    <button type="submit" className="view-btn" style={{ border: 'none', width: 'auto', padding: '10px 20px' }}>
                        <button onClick={startChat} className="view-btn" style={{ border: 'none', width: 'auto', padding: '10px 20px', marginBottom: 16 }}>
                            💬 Chat with Seller
                        </button>
                        Send Message
                    </button>
                </form>
            )}
        </div>
    );
}