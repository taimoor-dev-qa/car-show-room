import { Link } from 'react-router-dom';
import { categories } from './HomeIntro';
const emojiMap = {
  Sedan: "🚗",
  SUV: "🚙",
  Hatchback: "🚘",
  Electric: "⚡",
  Luxury: "🏎️",
  "Pickup Truck": "🛻",
};

export default function SaleListings({ cars, loading, activeCategory, setActiveCategory, sortBy, setSortBy, favoriteIds, toggleFavorite, selectedIds, toggleCompare }) {
  return (
      <section className="listings">
        <h1>Available Cars</h1>

        <p className="listings-subtitle">
          Browse our full inventory of quality used and new vehicles
        </p>

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
          <button
            className={`tab-btn ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => setActiveCategory('All')}
          >
            All
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="most_viewed">Most Viewed</option>
          </select>
        </div>

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
                {car.images?.[0] || car.image ? (
                  <img
                    src={`http://localhost:3500/uploads/${car.images?.[0] || car.image}`}
                    alt={car.makeModel}
                  />
                ) : (
                  <div className="car-emoji">
                    {emojiMap[car.category] || "🚗"}
                  </div>
                )}

                <span className="badge">{car.year}</span>
                <button
                  className={`wishlist-heart ${favoriteIds.includes(car._id) ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); toggleFavorite(car._id); }}
                >
                  ❤
                </button>
              </div>

              <h3>{car.makeModel}</h3>

              <p>{car.description}</p>

              <div className="car-meta">
                <span>{car.category}</span>
                <span>{car.year}</span>
                {car.mileage !== undefined && <span>{car.mileage.toLocaleString()} km</span>}
                {car.fuelType && <span>{car.fuelType}</span>}
                {car.transmission && <span>{car.transmission}</span>}
              </div>

              {car.isNegotiable && <span className="negotiable-badge">Negotiable</span>}

              <div className="car-price">
                Rs. {car.price?.toLocaleString()}
              </div>

              <label className="compare-toggle">
                <input type="checkbox" checked={selectedIds.includes(car._id)}
                  onChange={() => toggleCompare(car._id)} /> Compare
              </label>
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

  );
}
