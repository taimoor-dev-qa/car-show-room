import { Link } from 'react-router-dom';
import heroImage from '../../assets/green-yellow-red-purple-violet-sedan-sport-cars-standing-dark-space.jpg';
import sedanImg from '../../assets/categories/sedan 2.avif';
import suvImg from '../../assets/categories/suv.jpg';
import hatchbackImg from '../../assets/categories/hatchback.jpg';
import electricImg from '../../assets/categories/luxury.jpg';
import luxuryImg from '../../assets/categories/luxury 2.webp';
import pickupImg from '../../assets/categories/pickup truck.jpg';

export const categories = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Electric",
  "Luxury",
  "Pickup Truck",
];

const categoryImageMap = {
  Sedan: sedanImg,
  SUV: suvImg,
  Hatchback: hatchbackImg,
  Electric: electricImg,
  Luxury: luxuryImg,
  'Pickup Truck': pickupImg,
};

export default function HomeIntro({ user, logout, searchTerm, setSearchTerm, fetchCars }) {
  return <>
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

              <li>
                <Link to="/cars-for-rent">Cars for Rent</Link>
              </li>

              {user ? (
                <>
                  <li>
                    <Link to="/my-chats">My Chats</Link>
                  </li>

                  <li>
                    <Link to="/my-rentals">My Rentals</Link>
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

      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.75), rgba(15,23,42,0.85)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
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
            <div className="category-img-wrap">
              <img src={categoryImageMap[category]} alt={category} />
            </div>
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

          </div>
        </div>
      </section>

  </>;
}
