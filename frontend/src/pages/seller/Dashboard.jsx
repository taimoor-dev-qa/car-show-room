import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/seller-style.css';

export default function Dashboard() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [form, setForm] = useState({ makeModel: '', year: '', price: '', category: '', description: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();


  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/login');
      return;
    }
    fetchMyCars();
  }, []);

  const fetchMyCars = async () => {
    setLoading(true);
    try {
      const res = await API.get('/cars/mine');
      setCars(res.data);
    } catch (err) {
      console.error('Failed to fetch cars', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAddModal = () => {
    setEditingCar(null);
    setForm({ makeModel: '', year: '', price: '', category: '', description: '' });
    setImageFiles([]);
    setShowModal(true);
  };

  const openEditModal = (car) => {
    setEditingCar(car);
    setForm({
      makeModel: car.makeModel, year: car.year, price: car.price,
      category: car.category, description: car.description || '',
    });
    setImageFiles([]);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('makeModel', form.makeModel);
      data.append('year', form.year);
      data.append('price', form.price);
      data.append('category', form.category);
      data.append('description', form.description);

      imageFiles.forEach((file) => {
        data.append('images', file);   // same key 'images' baar baar — backend array me le lega
      });

      if (editingCar) {
        await API.put(`/cars/${editingCar._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await API.post('/cars', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowModal(false);
      setImageFiles([]);
      fetchMyCars();
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };


  const handleDelete = async (id) => {
    if (!confirm('Delete this car?')) return;
    try {
      await API.delete(`/cars/${id}`);
      fetchMyCars();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };
  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/cars/${id}`, { status: newStatus });
      fetchMyCars();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const stats = {
    listed: cars.filter(c => c.status !== 'sold').length,
    views: cars.reduce((sum, c) => sum + c.views, 0),
    sold: cars.filter(c => c.status === 'sold').length,
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🚗</div>
          <div className="brand-text"><h2>Car<span>Zone</span></h2><span>Seller Panel</span></div>
        </div>
        <div className="sidebar-section-title">MAIN MENU</div>
        <nav className="nav-menu">
          <Link to="/seller/dashboard" className="nav-item active"><span>Dashboard</span></Link>
          <Link to="/seller/rental-cars" className="nav-item"><span>Rental Cars</span></Link>
          <Link to="/seller/rental-requests" className="nav-item"><span>Rental Requests</span></Link>
          <Link to="/seller/inquiries" className="nav-item"><span>Inquiries</span></Link>
          <Link to="/seller/chat" className="nav-item"><span>Messages</span></Link>
        </nav>
        <div className="sidebar-section-title">SYSTEM</div>
        <nav className="nav-menu">
          <Link to="/seller/profile" className="nav-item"><span>Settings</span></Link>
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="back-to-site">← Back to CarZone</Link>
          <a onClick={logout} className="back-to-site" style={{ cursor: 'pointer' }}>Logout</a>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="page-heading">
            <span className="page-eyebrow">SELLER PANEL</span>
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name}. Here's how your listings are performing.</p>
          </div>
        </header>

        <div className="dashboard-cards">
          <div className="card">
            <div className="card-header"><div className="card-title">Cars Listed</div></div>
            <div className="card-value">{stats.listed}</div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Total Views</div></div>
            <div className="card-value">{stats.views}</div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Cars Sold</div></div>
            <div className="card-value">{stats.sold}</div>
          </div>
        </div>

        <div className="content-card">
          <div className="table-header">
            <div><h2>My Listed Cars</h2><p>Manage your active car listings.</p></div>
            <button className="add-btn" onClick={openAddModal}>+ Add Car</button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Car</th><th>Year</th><th>Price</th><th>Views</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan="6">Loading...</td></tr>}
                {!loading && cars.length === 0 && <tr><td colSpan="6">No cars listed yet.</td></tr>}
                {cars.map((car) => (
                  <tr key={car._id}>
                    <td>
                      {car.images?.[0] || car.image ? (
                        <img
                          src={`http://localhost:3500/uploads/${car.images?.[0] || car.image}`}
                          alt={car.makeModel}
                          style={{ width: 40, height: 30, objectFit: 'cover', borderRadius: 4, marginRight: 8, verticalAlign: 'middle' }}
                        />
                      ) : null}
                      {car.makeModel}
                    </td>
                    <td>{car.year}</td>
                    <td>Rs. {car.price.toLocaleString()}</td>
                    <td>{car.views}</td>
                    <td>
                      <select
                        value={car.status}
                        onChange={(e) => handleStatusChange(car._id, e.target.value)}
                        className={`status-pill ${car.status}`}
                        style={{ border: 'none', cursor: 'pointer' }}
                      >
                        <option value="pending">Pending Review</option>
                        <option value="active">Active</option>
                        <option value="sold">Sold</option>
                      </select>
                    </td>
                    <td>
                      <button className="row-action-btn" onClick={() => openEditModal(car)}>Edit</button>
                      <button className="row-action-btn danger" onClick={() => handleDelete(car._id)}>Delete</button>

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
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCar ? 'Edit Car' : 'Add New Car'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Car Make & Model</label>
                <input name="makeModel" value={form.makeModel} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input name="year" type="number" value={form.year} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Price (Rs.)</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  <option>Sedan</option><option>SUV</option><option>Hatchback</option>
                  <option>Electric</option><option>Luxury</option><option>Pickup Truck</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" rows="3" value={form.description} onChange={handleChange}></textarea>
              </div>
              <div className="form-group">
                <label>Car Images (up to 10)</label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageFiles(Array.from(e.target.files).slice(0, 10))}
                />
                {imageFiles.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {imageFiles.map((file, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 6 }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="submit-btn">Save Listing</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
