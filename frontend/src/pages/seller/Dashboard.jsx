import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import CarFormFields from '../../components/CarFormFields';

import '../../styles/seller-style.css';

const initialCarForm = () => ({
  makeModel: '',
  year: '',
  price: '',
  category: '',
  description: '',
  mileage: '',
  fuelType: '',
  transmission: '',
  ownerCount: 1,
  registrationCity: '',
  color: '',
  variant: '',
  engineCapacity: '',
  isRegistered: true,
  condition: '',
  hasAccidentHistory: false,
  accidentNotes: '',
  isNegotiable: false,
});

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [form, setForm] = useState(initialCarForm);
  const [imageFiles, setImageFiles] = useState([]);

  const loadCars = async () => {
    setLoading(true);

    try {
      const { data } = await API.get('/cars/mine');
      setCars(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
    } else {
      loadCars();
    }
  }, [navigate, user]);

  const change = (event) => {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setForm({
      ...form,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    });
  };

  const openModal = (car = null) => {
    setEditingCar(car);

    setForm(
      car
        ? {
            ...initialCarForm(),
            ...car,
            accidentNotes: car.accidentNotes || '',
          }
        : initialCarForm()
    );

    setImageFiles([]);
    setShowModal(true);
  };

  const submit = async (event) => {
    event.preventDefault();

    try {
      const data = new FormData();

      Object.entries(form).forEach(
        ([key, value]) => {
          data.append(key, value);
        }
      );

      imageFiles.forEach((file) => {
        data.append('images', file);
      });

      if (editingCar) {
        await API.put(
          `/cars/${editingCar._id}`,
          data
        );
      } else {
        await API.post(
          '/cars',
          data
        );
      }

      setShowModal(false);
      loadCars();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          'Something went wrong'
      );
    }
  };

  const remove = async (id) => {
    if (confirm('Delete this car?')) {
      await API.delete(`/cars/${id}`);
      loadCars();
    }
  };

  const removeStagedImage = (index) => {
    setImageFiles((files) =>
      files.filter(
        (_, fileIndex) =>
          fileIndex !== index
      )
    );
  };

  const changeStatus = async (id, status) => {
    await API.put(`/cars/${id}`, {
      status,
    });

    loadCars();
  };

  const stats = {
    listed: cars.filter(
      (car) => car.status !== 'sold'
    ).length,

    views: cars.reduce(
      (sum, car) => sum + car.views,
      0
    ),

    sold: cars.filter(
      (car) => car.status === 'sold'
    ).length,
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            Car
          </div>

          <div className="brand-text">
            <h2>
              Car<span>Zone</span>
            </h2>

            <span>
              Seller Panel
            </span>
          </div>
        </div>

        <div className="sidebar-section-title">
          MAIN MENU
        </div>

        <nav className="nav-menu">
          <Link
            to="/seller/dashboard"
            className="nav-item active"
          >
            Dashboard
          </Link>

          <Link
            to="/seller/rental-cars"
            className="nav-item"
          >
            Rental Cars
          </Link>

          <Link
            to="/seller/rental-requests"
            className="nav-item"
          >
            Rental Requests
          </Link>

          <Link
            to="/seller/inquiries"
            className="nav-item"
          >
            Inquiries
          </Link>

          <Link
            to="/seller/chat"
            className="nav-item"
          >
            Messages
          </Link>
        </nav>

        <div className="sidebar-section-title">
          SYSTEM
        </div>

        <nav className="nav-menu">
          <Link
            to="/seller/profile"
            className="nav-item"
          >
            Settings
          </Link>
        </nav>

        <div className="sidebar-footer">
          <Link
            to="/"
            className="back-to-site"
          >
            Back to CarZone
          </Link>

          <button
            className="back-to-site"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="page-heading">
            <span className="page-eyebrow">
              SELLER PANEL
            </span>

            <h1>
              Dashboard
            </h1>

            <p>
              Welcome back, {user?.name}. Here is how your listings
              are performing.
            </p>
          </div>
        </header>

        <div className="dashboard-cards">
          <Stat
            label="Cars Listed"
            value={stats.listed}
          />

          <Stat
            label="Total Views"
            value={stats.views}
          />

          <Stat
            label="Cars Sold"
            value={stats.sold}
          />
        </div>

        <div className="content-card">
          <div className="table-header">
            <div>
              <h2>
                My Listed Cars
              </h2>

              <p>
                Manage your active car listings.
              </p>
            </div>

            <button
              className="add-btn"
              onClick={() => openModal()}
            >
              + Add Car
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Car</th>
                  <th>Year</th>
                  <th>Price</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6">
                      Loading...
                    </td>
                  </tr>
                )}

                {!loading && !cars.length && (
                  <tr>
                    <td colSpan="6">
                      No cars listed yet.
                    </td>
                  </tr>
                )}

                {cars.map((car) => (
                  <tr key={car._id}>
                    <td>
                      {car.images?.[0] || car.image ? (
                        <img
                          src={`http://localhost:3500/uploads/${
                            car.images?.[0] || car.image
                          }`}
                          alt={car.makeModel}
                          style={{
                            width: 40,
                            height: 30,
                            objectFit: 'cover',
                            borderRadius: 4,
                            marginRight: 8,
                            verticalAlign: 'middle',
                          }}
                        />
                      ) : null}

                      {car.makeModel}
                    </td>

                    <td>
                      {car.year}
                    </td>

                    <td>
                      Rs. {car.price.toLocaleString()}
                    </td>

                    <td>
                      {car.views}
                    </td>

                    <td>
                      <select
                        value={car.status}
                        onChange={(event) =>
                          changeStatus(
                            car._id,
                            event.target.value
                          )
                        }
                        className={`status-pill ${car.status}`}
                        style={{
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="pending">
                          Pending Review
                        </option>

                        <option value="active">
                          Active
                        </option>

                        <option value="sold">
                          Sold
                        </option>
                      </select>
                    </td>

                    <td>
                      <button
                        className="row-action-btn"
                        onClick={() =>
                          openModal(car)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="row-action-btn danger"
                        onClick={() =>
                          remove(car._id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="modal active">
          <div className="modal-content modal-wide">
            <div className="modal-header">
              <h2>
                {editingCar
                  ? 'Edit Car'
                  : 'Add New Car'}
              </h2>

              <button
                className="close-btn"
                onClick={() =>
                  setShowModal(false)
                }
              >
                &times;
              </button>
            </div>

            <form onSubmit={submit}>
              <CarFormFields
                form={form}
                change={change}
              />

              <div className="form-group">
                <label>
                  Car Images (up to 10)
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setImageFiles(
                      Array.from(
                        event.target.files
                      ).slice(0, 10)
                    )
                  }
                />

                {imageFiles.length > 0 && (
                  <div className="image-preview-row">
                    {imageFiles.map(
                      (file, index) => (
                        <div
                          className="image-preview-item"
                          key={`${file.name}-${file.lastModified}`}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                          />

                          <button
                            type="button"
                            className="image-preview-remove"
                            aria-label={`Remove ${file.name}`}
                            onClick={() =>
                              removeStagedImage(
                                index
                              )
                            }
                          >
                            &times;
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="submit-btn"
              >
                Save Listing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          {label}
        </div>
      </div>

      <div className="card-value">
        {value}
      </div>
    </div>
  );
}