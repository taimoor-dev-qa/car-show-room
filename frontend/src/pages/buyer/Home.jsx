import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/01-base-header.css';
import '../../styles/02-hero-categories.css';
import '../../styles/03-featured-listings.css';
import '../../styles/04-car-card.css';
import '../../styles/05-stats-testimonials.css';
import '../../styles/06-cta-footer.css';
import '../../styles/07-car-detail.css';

const categories = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Electric",
  "Luxury",
  "Pickup Truck",
];

const emojiMap = {
  Sedan: "🚗",
  SUV: "🚙",
  Hatchback: "🚘",
  Electric: "⚡",
  Luxury: "🏎️",
  "Pickup Truck": "🛻",
};

export default function Home() {
  const [cars, setCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const { user, logout } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCars();
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCars = async () => {
    setLoading(true);

    try {
      const params = {};

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await API.get("/cars", { params });

      setCars(res.data);
    } catch (err) {
      console.error("Failed to fetch cars", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= HEADER ================= */}

      <header>
        <div className="container">
          <Link to="/" className="logo">
            Car<span>Zone</span>
          </Link>

          <nav>
            <div className="menu-icon">☰</div>

            <ul className="nav-list">
              <li>
                <Link to="/" className="active">
                  Browse Cars
                </Link>
              </li>

              {user ? (
                <>
                  <li>
                    <Link to="/my-chats">My Chats</Link>
                  </li>

                  <li>
                    <button
                      type="button"
                      className="logout-link"
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" className="seller-link">
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Next Car</h1>

          <p>
            Browse verified listings from trusted sellers across the country
          </p>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search by make or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button type="button" onClick={fetchCars}>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ================= CATEGORY STRIP ================= */}

      <section className="category-strip">
        {categories.map((category) => (
          <div key={category} className="category-item">
            <span>{emojiMap[category]}</span>
            <p>{category}</p>
          </div>
        ))}
      </section>

      {/* ================= FEATURED CAR ================= */}

      <section className="featured-car">
        <div className="featured-content">
          <div className="featured-text">
            <span className="featured-tag">FEATURED CAR</span>

            <h2>Find A Car That Fits Your Lifestyle</h2>

            <p>
              Explore quality vehicles from trusted sellers and discover your
              next perfect car with CarZone.
            </p>

            <div className="featured-price">
              Quality &nbsp; • &nbsp; Verified &nbsp; • &nbsp; Trusted
            </div>

            <Link to="/cars" className="featured-btn">
              Browse Cars
            </Link>
          </div>

          <div className="featured-image">
            🚗
          </div>
        </div>
      </section>

      {/* ================= LISTINGS ================= */}

      <section className="listings">
        <h1>Available Cars</h1>

        <p className="listings-subtitle">
          Browse our full inventory of quality used and new vehicles
        </p>

        <p className="results-count">
          {loading ? (
            "Loading..."
          ) : (
            <>
              Showing <strong>{cars.length}</strong> cars
            </>
          )}
        </p>

        <div className="car-grid">
          {!loading && cars.length === 0 && (
            <div className="empty-state">
              <h3>No Cars Found</h3>
              <p>Try searching for another make or model.</p>
            </div>
          )}

          {cars.map((car) => (
            <div key={car._id} className="car-card">
              <div className="car-img-wrap">
                {car.image ? (
                  <img
                    src={`http://localhost:3500/uploads/${car.image}`}
                    alt={car.makeModel}
                  />
                ) : (
                  <div className="car-emoji">
                    {emojiMap[car.category] || "🚗"}
                  </div>
                )}

                <span className="badge">{car.year}</span>
              </div>

              <h3>{car.makeModel}</h3>

              <p>{car.description}</p>

              <div className="car-meta">
                <span>{car.category}</span>
                <span>{car.year}</span>
              </div>

              <div className="car-price">
                Rs. {car.price?.toLocaleString()}
              </div>

              <Link
                to={`/car/${car._id}`}
                className="view-btn"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ================= STATS ================= */}

      <section className="stats">
        <div className="stats-grid">
          <div className="stat-item">
            <h2>150+</h2>
            <p>Cars Listed</p>
          </div>

          <div className="stat-item">
            <h2>25K+</h2>
            <p>Happy Customers</p>
          </div>

          <div className="stat-item">
            <h2>40+</h2>
            <p>Trusted Sellers</p>
          </div>

          <div className="stat-item">
            <h2>4.8★</h2>
            <p>Customer Rating</p>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}

      <section className="testimonials">
        <h1>What Our Customers Say</h1>

        <p className="section-subtitle">
          Real experiences from people who found their cars with CarZone
        </p>

        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p className="stars">★★★★★</p>

            <p className="testimonial-text">
              CarZone made it really easy to find the right car. The listings
              were clear and the seller was trustworthy.
            </p>

            <h4>— Ahmed</h4>
          </div>

          <div className="testimonial-card">
            <p className="stars">★★★★★</p>

            <p className="testimonial-text">
              I found exactly what I was looking for. The whole process was
              simple and convenient.
            </p>

            <h4>— Sarah</h4>
          </div>

          <div className="testimonial-card">
            <p className="stars">★★★★★</p>

            <p className="testimonial-text">
              Great selection of cars and an easy-to-use website. I would
              definitely recommend CarZone.
            </p>

            <h4>— Bilal</h4>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="cta-banner">
        <h2>Ready To Find Your Next Car?</h2>

        <p>
          Explore our latest listings and find the vehicle that is right for
          you.
        </p>

        <Link to="/cars" className="cta-btn">
          Browse All Cars
        </Link>
      </section>

      {/* ================= FOOTER ================= */}

      <footer>
        <p>© 2026 CarZone. All Rights Reserved.</p>
      </footer>
    </>
  );
}