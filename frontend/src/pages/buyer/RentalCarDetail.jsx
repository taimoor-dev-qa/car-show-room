import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import API from '../../api/axios';
import RentalRequestForm from '../../components/RentalRequestForm';

import '../../styles/07-car-detail.css';
import '../../styles/10-rental.css';

const imageUrl = (image) =>
  `http://localhost:3500/uploads/${image}`;

const dateText = (date) =>
  new Date(date).toLocaleDateString();

export default function RentalCarDetail() {
  const { id } = useParams();

  const [rental, setRental] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    API.get(`/rentals/${id}`)
      .then(({ data }) => {
        setRental(data);
        setActiveImage(0);
      })
      .catch(() => {
        setRental(false);
      });
  }, [id]);

  if (rental === null) {
    return (
      <p className="detail-loading">
        Loading rental car...
      </p>
    );
  }

  if (!rental) {
    return (
      <p className="detail-loading">
        Rental car not found.
      </p>
    );
  }

  const seller =
    rental.seller?.businessName ||
    rental.seller?.name ||
    'Seller';

  return (
    <main className="car-detail-wrapper rental-detail">
      <Link
        className="detail-back-btn"
        to="/cars-for-rent"
      >
        ← Back to rentals
      </Link>

      <div className="detail-image-wrap">
        {rental.images?.length ? (
          <img
            src={imageUrl(rental.images[activeImage])}
            alt={rental.makeModel}
          />
        ) : (
          <div className="detail-image-placeholder">
            🚗
          </div>
        )}
      </div>

      {rental.images?.length > 1 && (
        <div className="detail-thumbnail-row">
          {rental.images.map((image, index) => (
            <img
              className={`detail-thumbnail ${
                index === activeImage ? 'active' : ''
              }`}
              key={image}
              src={imageUrl(image)}
              alt={`${rental.makeModel} ${index + 1}`}
              onClick={() => setActiveImage(index)}
            />
          ))}
        </div>
      )}

      <div className="detail-title-row">
        <div>
          <h1>
            {rental.makeModel}
            {rental.variant
              ? ` ${rental.variant}`
              : ''}
          </h1>

          <p className="detail-subtitle">
            {rental.year} · {rental.category} · {rental.city}
          </p>
        </div>

        <div className="detail-price-tag">
          PKR {rental.dailyRate.toLocaleString()}/day
        </div>
      </div>

      <div className="detail-meta-grid rental-specs">
        <Spec
          label="Transmission"
          value={rental.transmission}
        />

        <Spec
          label="Fuel"
          value={rental.fuelType}
        />

        <Spec
          label="Seats"
          value={rental.seats}
        />

        <Spec
          label="Mileage"
          value={`${rental.mileage.toLocaleString()} km`}
        />
      </div>

      <section className="rental-info-grid">
        <div className="detail-description-card">
          <h3>
            Rental Details
          </h3>

          <p>
            <strong>Pickup:</strong>{' '}
            {rental.pickupArea}, {rental.city}
          </p>

          <p>
            <strong>Available:</strong>{' '}
            {dateText(rental.availableFrom)} –{' '}
            {dateText(rental.availableUntil)}
          </p>

          <p>
            <strong>Rental period:</strong>{' '}
            {rental.minRentalDays} to {rental.maxRentalDays} days
          </p>

          <p>
            <strong>Driver:</strong>{' '}
            {rental.driverAvailable
              ? `Available${
                  rental.driverCharges
                    ? ` (PKR ${rental.driverCharges.toLocaleString()}/day)`
                    : ''
                }`
              : 'Not available'}
          </p>
        </div>

        <div className="detail-seller-strip">
          <div className="detail-seller-avatar">
            {seller.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>
              {seller}
            </strong>

            <small>
              Rental provider
            </small>
          </div>
        </div>
      </section>

      <section className="detail-description-card">
        <h3>
          Description
        </h3>

        <p>
          {rental.description ||
            'No description provided.'}
        </p>
      </section>

      <RentalRequestForm rental={rental} />
    </main>
  );
}

function Spec({ label, value }) {
  return (
    <div className="detail-meta-card">
      <div className="detail-meta-label">
        {label}
      </div>

      <div className="detail-meta-value">
        {value}
      </div>
    </div>
  );
}