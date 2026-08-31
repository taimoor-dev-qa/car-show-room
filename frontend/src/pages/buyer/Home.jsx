import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/buyer-style.css';

const categories = ['All', 'Sedan', 'SUV', 'Hatchback', 'Electric', 'Luxury', 'Pickup Truck'];

const emojiMap = {
  Sedan: '🚗', SUV: '🚙', Hatchback: '🚘', Electric: '⚡', Luxury: '🏎️', 'Pickup Truck': '🛻',
};

export default function Home() {
  const [cars, setCars] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCars();
    }, 400); // 400ms wait karega typing rukne ke baad

    return () => clearTimeout(timer);
  }, [activeCategory, searchTerm]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== 'All') params.category = activeCategory;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await API.get('/cars', { params });
      setCars(res.data);
    } catch (err) {
      console.error('Failed to fetch cars', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <header>
        <div className="container">
          <h2 className="logo">Car<span>Zone</span></h2>
          <nav>
            <ul className="nav-list" style={{ display: 'flex', listStyle: 'none' }}>
              <li><Link to="/" className="active">Browse Cars</Link></li>
              {user?.role === 'seller' ? (
                <li><Link to="/seller/dashboard" className="seller-link">Seller Dashboard</Link></li>
              ) : user ? (
                <>
                  <li><Link to="/my-chats">My Chats</Link></li>
                  <li><a onClick={logout} style={{ cursor: 'pointer' }}>Logout</a></li>
                </>
              ) : (
                <li><Link to="/login" className="seller-link">Login</Link></li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by make or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="button" onClick={fetchCars}>Search</button>
        </div> <br></br> <br></br>

        <div className="hero-content">
          <h1>Find Your Next Car</h1>
          <p>Browse verified listings from trusted sellers across the country</p>
        </div>
      </section>

      {/* Category Strip */}
      <section className="category-strip">
        {categories.slice(1).map((cat) => (
          <div key={cat} className="category-item" onClick={() => setActiveCategory(cat)}>
            <span>{emojiMap[cat]}</span>
            <p>{cat}</p>
          </div>
        ))}
      </section>

      {/* Listings */}
      <section className="listings">
        <h1>Available Cars</h1>
        <p className="listings-subtitle">Browse our full inventory of quality used and new vehicles</p>

        <div className="filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="results-count">
          {loading ? 'Loading...' : <>Showing <strong>{cars.length}</strong> cars</>}
        </p>

        <div className="car-grid">
          {!loading && cars.length === 0 && <p>No cars found in this category.</p>}

          {cars.map((car) => (
            <div key={car._id} className="car-card">
              <div className="car-img-wrap">
                {car.image ? (
                  <img
                    src={`http://localhost:3500/uploads/${car.image}`}
                    alt={car.makeModel}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="car-emoji">{emojiMap[car.category] || '🚗'}</div>
                )}
                <span className="badge">{car.year}</span>
              </div>
              <h3>{car.makeModel}</h3>
              <p>{car.description}</p>
              <div className="car-price">Rs. {car.price.toLocaleString()}</div>
              <Link to={`/car/${car._id}`} className="view-btn">View Details</Link>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <p>&copy; 2026 CarZone. All Rights Reserved.</p>
      </footer>
    </>
  );
}