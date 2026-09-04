import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/01-base-header.css';
import '../../styles/04-car-card.css';
import '../../styles/10-rental.css';

const categories = ['All', 'Sedan', 'SUV', 'Hatchback', 'Electric', 'Luxury', 'Pickup Truck'];
const imageUrl = (image) => `http://localhost:3500/uploads/${image}`;

export default function CarsForRent() {
  const { user, logout } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [filters, setFilters] = useState({ city: '', category: 'All', minPrice: '', maxPrice: '' });
  const [loading, setLoading] = useState(true);
  const fetchRentals = async () => { setLoading(true); try { const { data } = await API.get('/rentals', { params: filters }); setRentals(data); } finally { setLoading(false); } };
  useEffect(() => { fetchRentals(); }, []);
  const change = (event) => setFilters({ ...filters, [event.target.name]: event.target.value });

  return <><header><div className="container"><Link to="/" className="logo">Car<span>Zone</span></Link><nav><ul className="nav-list"><li><Link to="/">Browse Cars</Link></li><li><Link to="/cars-for-rent" className="active">Cars for Rent</Link></li>{user ? <><li><Link to="/my-chats">My Chats</Link></li><li><Link to="/my-rentals">My Rentals</Link></li><li><button type="button" className="logout-link" onClick={logout}>Logout</button></li></> : <li><Link to="/login" className="seller-link">Login</Link></li>}</ul></nav></div></header>
    <main className="rental-page"><div className="rental-heading"><span>CAR RENTAL</span><h1>Find the right car for your trip</h1><p>Explore active rental vehicles from trusted sellers.</p></div>
      <form className="rental-filters" onSubmit={(event) => { event.preventDefault(); fetchRentals(); }}><input name="city" placeholder="City" value={filters.city} onChange={change} /><select name="category" value={filters.category} onChange={change}>{categories.map((category) => <option key={category}>{category}</option>)}</select><input name="minPrice" type="number" placeholder="Min PKR/day" value={filters.minPrice} onChange={change} /><input name="maxPrice" type="number" placeholder="Max PKR/day" value={filters.maxPrice} onChange={change} /><button>Apply Filters</button></form>
      <p className="rental-count">{loading ? 'Loading rentals...' : `${rentals.length} rental cars available`}</p>
      <div className="car-grid">{!loading && !rentals.length && <div className="empty-state"><h3>No rental cars found</h3><p>Try changing your filters or check back soon.</p></div>}
        {rentals.map((rental) => <article className="car-card rental-card" key={rental._id}><div className="car-img-wrap">{rental.images?.[0] ? <img src={imageUrl(rental.images[0])} alt={rental.makeModel} /> : <div className="car-emoji">🚗</div>}<span className="rental-rate">PKR {rental.dailyRate.toLocaleString()}/day</span></div><h3>{rental.makeModel}{rental.variant ? ` ${rental.variant}` : ''}</h3><p>{rental.city} · {rental.transmission} · {rental.seats} seats</p><div className="car-meta"><span>{rental.category}</span><span>{rental.driverAvailable ? 'Driver available' : 'Self drive'}</span></div><Link className="view-btn" to={`/rental/${rental._id}`}>View Rental Details</Link></article>)}
      </div>
    </main>
  </>;
}
