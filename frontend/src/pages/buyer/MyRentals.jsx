import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import RentalRequestDetails from '../../components/RentalRequestDetails';
import '../../styles/01-base-header.css';
import '../../styles/04-car-card.css';
import '../../styles/10-rental.css';
const imageUrl = (image) => `http://localhost:3500/uploads/${image}`;

const dateText = (date) => new Date(date).toLocaleDateString();
export default function MyRentals() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const { data } = await API.get('/rental-requests/mine');

      setRequests(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load rental requests.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      load();
    }
  }, [navigate, user]);

  const cancel = async (id) => {
    if (!confirm('Cancel this rental request?')) {
      return;
    }

    try {
      await API.patch(`/rental-requests/${id}/cancel`);

      load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not cancel request.'
      );
    }
  };

  return (
    <>
      <header>
        <div className="container">
          <Link to="/" className="logo">
            Car<span>Zone</span>
          </Link>

          <nav>
            <ul className="nav-list">
              <li>
                <Link to="/">Browse Cars</Link>
              </li>

              <li>
                <Link to="/cars-for-rent">Cars for Rent</Link>
              </li>

              <li>
                <Link to="/my-chats">My Chats</Link>
              </li>

              <li>
                <Link to="/my-rentals" className="active">
                  My Rentals
                </Link>
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
            </ul>
          </nav>
        </div>
      </header>

      <main className="rental-page">
        <div className="rental-heading">
          <span>MY RENTALS</span>

          <h1>Rental Requests</h1>

          <p>
            Track the requests you have sent to rental providers.
          </p>
        </div>

        {error && (
          <p className="rental-error">
            {error}
          </p>
        )}

        <div className="rental-request-list">
          {loading && (
            <p>Loading rental requests...</p>
          )}

          {!loading && !requests.length && (
            <div className="empty-state">
              <h3>No rental requests yet</h3>

              <p>
                Browse rental cars and send a request when you find
                the right one.
              </p>
            </div>
          )}

          {requests.map((request) => (
            <article
              className="rental-request-item"
              key={request._id}
            >
              <div className="request-thumb">
                {request.rentalCar?.images?.[0] ? (
                  <img
                    src={imageUrl(request.rentalCar.images[0])}
                    alt={request.rentalCar.makeModel}
                  />
                ) : (
                  'Car'
                )}
              </div>

              <div className="request-main">
                <h3>
                  {request.rentalCar?.makeModel ||
                    'Rental car unavailable'}
                </h3>

                <p>
                  {dateText(request.startDate)} -{' '}
                  {dateText(request.endDate)} ({request.totalDays}{' '}
                  days)
                </p>

                <small>
                  {request.seller?.businessName ||
                    request.seller?.name ||
                    'Rental provider'}
                </small>

                <RentalRequestDetails request={request} />
              </div>

              <div className="request-summary">
                <span
                  className={`status-pill rental-request-status ${request.status}`}
                >
                  {request.status}
                </span>

                <strong>
                  PKR {request.estimatedTotal.toLocaleString()}
                </strong>

                {request.status === 'pending' && (
                  <button
                    type="button"
                    className="row-action-btn danger"
                    onClick={() => cancel(request._id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
